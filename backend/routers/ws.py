import asyncio
import base64
import json
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi.websockets import WebSocketState

from db.supabase import get_supabase, verify_token
from services.redis_state import get_session_state, set_session_state, delete_session_state
from services.stt import transcribe_audio, transcribe_audio_full
from services.llm import stream_conversation, stream_diagnostic_score, stream_correction_check
from services.tts import stream_tts
from services.pronunciation import score_pronunciation
from services.memory import load_user_memory, build_memory_context, update_user_memory
from prompts.diagnostic import DIAGNOSTIC_SYSTEM, DIAGNOSTIC_CONVERSATION_SYSTEM
from prompts.training import build_training_prompt
from prompts.interview import build_interview_prompt
from prompts.conversation import build_conversation_prompt
from prompts.professional import build_professional_prompt
from prompts.accent import build_accent_prompt
from models.session import SessionState

router = APIRouter()


async def send_json(ws: WebSocket, data: dict):
    if ws.client_state == WebSocketState.CONNECTED:
        await ws.send_text(json.dumps(data))


async def run_silence_nudge(ws: WebSocket, session_id: str):
    """Background task: send a nudge if user has been silent > 3s and AI is not speaking."""
    while True:
        await asyncio.sleep(0.5)
        try:
            state = await get_session_state(session_id)
            if state is None:
                break
            if state.get("tts_is_speaking"):
                continue
            silence_start = state.get("silence_timer_start")
            if silence_start and (time.time() - silence_start) > 3.0:
                state["silence_timer_start"] = None
                await set_session_state(session_id, state)
                await send_json(ws, {"type": "nudge"})
        except Exception:
            break


async def _pipe_sentence_to_tts(
    ws: WebSocket,
    session_id: str,
    sentence: str,
    accent: str,
) -> bool:
    """
    Send one sentence chunk to Cartesia and stream audio chunks to client.
    Returns False if interrupted (tts_is_speaking flipped to False by interrupt message).
    Never buffers full TTS response — streams each audio chunk as it arrives.
    """
    async for audio_chunk in stream_tts(sentence, accent=accent):
        if not audio_chunk:
            continue
        current_state = await get_session_state(session_id)
        if current_state is None or not current_state.get("tts_is_speaking"):
            return False  # interrupted
        await send_json(ws, {
            "type": "tts_chunk",
            "data": base64.b64encode(audio_chunk).decode("utf-8"),
        })
    return True


async def handle_stream_b(
    ws: WebSocket,
    session_id: str,
    transcript: str,
    state: dict,
):
    """
    Stream B: LLM tokens → sentence chunks → Cartesia TTS → client audio.

    Streaming pipeline (no buffering):
      LLM token arrives → append to sentence buffer
      Sentence boundary hit → fire that sentence to Cartesia immediately
      Cartesia audio chunk arrives → forward to client immediately

    This achieves < 750ms total latency:
      STT(200) + LLM first token(200) + first sentence assembled(~100) + Cartesia first chunk(300)
    """
    supabase = get_supabase()
    mode = state.get("mode", "training")
    turn_count = state.get("diagnostic_turn_count", 0)
    accent = state.get("preferred_accent", "american")

    try:
        user_res = supabase.table("users").select("cefr_level, preferred_accent").eq("id", state["user_id"]).single().execute()
        user_data = user_res.data or {}
    except Exception:
        user_data = {}

    cefr = state.get("cefr_level") or user_data.get("cefr_level") or "B1"
    accent = user_data.get("preferred_accent", "american")

    # Build memory context to prepend to every prompt
    user_memory = state.get("user_memory", {})
    user_name = (user_data.get("full_name") or "").strip().split()[0] if user_data.get("full_name") else ""
    memory_ctx = build_memory_context(user_memory, user_name)

    if mode == "diagnostic":
        system_prompt = memory_ctx + DIAGNOSTIC_CONVERSATION_SYSTEM
    elif mode == "interview":
        system_prompt = memory_ctx + build_interview_prompt()
    elif mode == "conversation":
        system_prompt = memory_ctx + build_conversation_prompt(cefr, accent)
    elif mode == "professional":
        system_prompt = memory_ctx + build_professional_prompt(cefr, accent)
    elif mode == "accent":
        exam_target = (user_data.get("exam_target") or "general").lower()
        accent_context_map = {
            "ielts": "ielts", "toefl": "toefl",
            "job interview": "interview", "interview": "interview",
        }
        ctx = accent_context_map.get(exam_target, "daily")
        system_prompt = memory_ctx + build_accent_prompt(accent, cefr, context=ctx)
    else:  # training (default for "training" and any unknown mode)
        top_errors = state.get("top_recurring_errors", [])
        topic = state.get("current_topic", "general")
        system_prompt = memory_ctx + build_training_prompt(cefr, top_errors, topic, accent)

    # Sentence boundary characters — flush to TTS when hit
    SENTENCE_ENDS = {'.', '!', '?'}
    MIN_SENTENCE_LEN = 30  # avoid firing TTS on fragments like "Right." or "I see."

    sentence_buf = ""
    full_response = ""
    interrupted = False

    try:
        async for token in stream_conversation(system_prompt, transcript, state):
            sentence_buf += token
            full_response += token

            # Check if diagnostic signals assessment complete
            if mode == "diagnostic" and "[ASSESSMENT_COMPLETE]" in full_response:
                full_response = full_response.replace("[ASSESSMENT_COMPLETE]", "").strip()
                sentence_buf = sentence_buf.replace("[ASSESSMENT_COMPLETE]", "").strip()
                # Don't speak this token — break and let scoring trigger
                interrupted = True
                break

            # Flush to TTS on natural sentence boundary
            if (
                any(sentence_buf.rstrip().endswith(e) for e in SENTENCE_ENDS)
                and len(sentence_buf.strip()) >= MIN_SENTENCE_LEN
            ):
                chunk = sentence_buf.strip()
                sentence_buf = ""
                ok = await _pipe_sentence_to_tts(ws, session_id, chunk, accent)
                if not ok:
                    interrupted = True
                    break

        # Flush any trailing text (e.g. response ended without punctuation)
        if not interrupted and sentence_buf.strip():
            await _pipe_sentence_to_tts(ws, session_id, sentence_buf.strip(), accent)

        if not interrupted:
            await send_json(ws, {"type": "tts_done"})

        # Persist AI turn to conversation history
        if full_response:
            current_state = await get_session_state(session_id)
            if current_state:
                current_state["conversation_history"].append({"role": "assistant", "content": full_response})
                current_state["session_transcript"] += f"\nAssistant: {full_response}"
                await set_session_state(session_id, current_state)

    except Exception as e:
        await send_json(ws, {"type": "error", "message": f"Stream B error: {str(e)}"})
    finally:
        refreshed = await get_session_state(session_id)
        if refreshed:
            refreshed["tts_is_speaking"] = False
            refreshed["silence_timer_start"] = time.time()
            await set_session_state(session_id, refreshed)

    # Diagnostic scoring: trigger after turn 5.
    # Two conditions — either sentinel OR turn count fallback (guards against LLM not outputting sentinel)
    current_state = await get_session_state(session_id)
    diagnostic_done = (current_state or state).get("is_diagnostic_complete", False)
    if mode == "diagnostic" and turn_count >= 5 and not diagnostic_done:
        await trigger_diagnostic_score(ws, session_id, current_state or state)


async def handle_stream_c(
    ws: WebSocket,
    session_id: str,
    transcript: str,
    state: dict,
):
    """Stream C: Fire-and-forget error check (500ms budget)."""
    try:
        async with asyncio.timeout(0.5):
            result = await stream_correction_check(transcript)
            if result and result.get("error"):
                await send_json(ws, {
                    "type": "correction_card",
                    "error": result,
                })
                # Persist error to Supabase
                supabase = get_supabase()
                existing = (
                    supabase.table("errors")
                    .select("id, recurrence_count")
                    .eq("user_id", state["user_id"])
                    .eq("original_utterance", result.get("original", ""))
                    .eq("error_type", result.get("error_type", ""))
                    .limit(1)
                    .execute()
                )
                if existing.data:
                    err_id = existing.data[0]["id"]
                    new_count = existing.data[0]["recurrence_count"] + 1
                    supabase.table("errors").update({
                        "recurrence_count": new_count,
                        "last_seen": datetime.now(timezone.utc).isoformat(),
                    }).eq("id", err_id).execute()
                else:
                    supabase.table("errors").insert({
                        "user_id": state["user_id"],
                        "session_id": state.get("session_db_id"),
                        "error_type": result.get("error_type", "UNKNOWN"),
                        "original_utterance": result.get("original", transcript),
                        "corrected_form": result.get("corrected", ""),
                        "explanation": result.get("explanation", ""),
                    }).execute()

                # Update session error count
                state["error_count_this_session"] = state.get("error_count_this_session", 0) + 1
                await set_session_state(session_id, state)
    except asyncio.TimeoutError:
        pass  # Silently drop — never block Stream B
    except Exception:
        pass  # Never let Stream C crash the session


async def trigger_diagnostic_score(ws: WebSocket, session_id: str, state: dict):
    """
    Call Llama 3.3 70B for full IELTS-rubric-grounded scoring after 5 turns.
    Merges Whisper pronunciation proxy scores into the result if Azure is unavailable.
    """
    try:
        supabase = get_supabase()

        # Merge Whisper pronunciation proxy into transcript context
        pron_scores = state.get("pronunciation_scores", [])
        transcript = state.get("session_transcript", "")

        if pron_scores:
            avg_pron = sum(pron_scores) / len(pron_scores)
            pron_ielts = round(avg_pron / 100 * 9 * 2) / 2  # map to 0.5 steps
            transcript += (
                f"\n\n[SYSTEM NOTE FOR SCORER: Whisper pronunciation confidence proxy = "
                f"{avg_pron:.1f}/100 (≈ IELTS {pron_ielts}). "
                f"Use this as a data point for your pronunciation band, not the sole determinant.]"
            )

        result = await stream_diagnostic_score(transcript)
        if result:
            state["is_diagnostic_complete"] = True
            state["cefr_level"] = result.get("cefr_level")
            await set_session_state(session_id, state)

            # Update user profile
            supabase.table("users").update({
                "cefr_level": result.get("cefr_level"),
                "ielts_score": result.get("ielts_equivalent"),
                "last_active": datetime.now(timezone.utc).isoformat(),
            }).eq("id", state["user_id"]).execute()

            # Update session row with all subscores
            supabase.table("sessions").update({
                "cefr_score": result.get("cefr_level"),
                "fluency_score": result.get("fluency"),
                "lexical_score": result.get("lexical"),
                "grammar_score": result.get("grammar"),
                "pronunciation_score": result.get("pronunciation"),
            }).eq("id", state.get("session_db_id")).execute()

            # Save personalized learning plan
            supabase.table("learning_plans").insert({
                "user_id": state["user_id"],
                "plan_json": result,
            }).execute()

            await send_json(ws, {"type": "diagnostic_complete", "result": result})
    except Exception as e:
        await send_json(ws, {"type": "error", "message": f"Diagnostic scoring error: {str(e)}"})


@router.websocket("/ws/{session_id}")
async def websocket_session(
    websocket: WebSocket,
    session_id: str,
    token: Optional[str] = Query(None),
    mode: str = Query("training"),
    accent: Optional[str] = Query(None),
):
    # Must accept before closing — closing an unaccepted WS returns 403 to client.
    await websocket.accept()

    if not token:
        await send_json(websocket, {"type": "error", "message": "Missing token"})
        await websocket.close(code=4001, reason="Missing token")
        return

    user = verify_token(token)
    if not user:
        await send_json(websocket, {"type": "error", "message": "Invalid or expired token"})
        await websocket.close(code=4001, reason="Invalid token")
        return
    supabase = get_supabase()
    user_id = user["id"]

    # Step 2: Create session row in Supabase
    session_db_id = str(uuid.uuid4())
    try:
        supabase.table("sessions").insert({
            "id": session_db_id,
            "user_id": user_id,
            "mode": mode,
        }).execute()
    except Exception as e:
        await send_json(websocket, {"type": "error", "message": f"Session creation failed: {str(e)}"})
        await websocket.close()
        return

    # Step 3: Load top recurring errors
    errors_res = (
        supabase.table("errors")
        .select("error_type, original_utterance, recurrence_count")
        .eq("user_id", user_id)
        .eq("resolved", False)
        .order("recurrence_count", desc=True)
        .limit(3)
        .execute()
    )
    top_errors = errors_res.data or []

    # Step 4: Load user profile
    user_res = supabase.table("users").select("*").eq("id", user_id).single().execute()
    user_data = user_res.data or {}

    # Step 5: Load user memory (persistent learning context across sessions)
    user_memory = load_user_memory(user_id)

    # Step 6: Initialize Redis session state
    state = {
        "user_id": user_id,
        "mode": mode,
        "is_diagnostic_complete": False,
        "diagnostic_turn_count": 0,
        "current_topic": user_memory.get("preferred_topics", ["career"])[0] if user_memory.get("preferred_topics") else "career",
        "silence_timer_start": None,
        "error_count_this_session": 0,
        "cefr_level": user_data.get("cefr_level"),
        "top_recurring_errors": top_errors,
        "tts_is_speaking": False,
        "session_db_id": session_db_id,
        "preferred_accent": accent or user_data.get("preferred_accent", "american"),
        "conversation_history": [],
        "session_transcript": "",
        "session_started_at": time.time(),
        "user_memory": user_memory,
    }
    await set_session_state(session_id, state)

    # Step 7: Send session_ready + trigger AI greeting
    await send_json(websocket, {
        "type": "session_ready",
        "cefr": user_data.get("cefr_level"),
        "mode": mode,
        "session_id": session_db_id,
    })

    # Start silence nudge background task
    nudge_task = asyncio.create_task(run_silence_nudge(websocket, session_id))

    # Build personalised greeting using the user's name if available
    first_name = ""
    full_name = user_data.get("full_name", "")
    if full_name:
        first_name = full_name.strip().split()[0]

    name_part = f", {first_name}" if first_name else ""

    greetings = {
        "diagnostic":   f"Welcome{name_part}. I'll ask you five questions to assess your current English level — just speak naturally, there are no right or wrong answers. Let's start: can you tell me about your work or studies?",
        "training":     f"Hey{name_part}! Good to have you. Let's get straight into it — tell me, what's been keeping you busy lately?",
        "interview":    f"Thanks for coming in{name_part}. Let's jump straight to it — walk me through your background. Who are you and what do you do?",
        "conversation": f"Hey{name_part}! Great to chat. So — what's going on with you lately? Anything interesting happen this week?",
        "professional": f"Right{name_part}, let's get started. Give me a quick summary of what you're currently working on.",
        "accent":       f"Welcome{name_part}. We're going to work on your pronunciation through shadowing. I'll say a phrase, you repeat it back. Ready? Let's start simple: \"I need to think about it.\" Your turn — repeat that.",
    }
    greeting_text = greetings.get(mode, greetings["training"])

    state["tts_is_speaking"] = True
    state["conversation_history"].append({"role": "assistant", "content": greeting_text})
    await set_session_state(session_id, state)

    async for audio_chunk in stream_tts(greeting_text, accent=state["preferred_accent"]):
        await send_json(websocket, {
            "type": "tts_chunk",
            "data": base64.b64encode(audio_chunk).decode("utf-8"),
        })

    await send_json(websocket, {"type": "tts_done"})
    state["tts_is_speaking"] = False
    state["silence_timer_start"] = time.time()
    await set_session_state(session_id, state)

    # ── Main message loop ────────────────────────────────────────────────────
    audio_buffer = bytearray()

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type")

            if msg_type == "audio_chunk":
                chunk_data = msg.get("data", "")
                audio_buffer.extend(base64.b64decode(chunk_data))

            elif msg_type == "turn_end":
                if not audio_buffer:
                    continue

                audio_bytes = bytes(audio_buffer)
                audio_buffer.clear()

                # Transcribe — use full result in diagnostic mode for pronunciation hints
                try:
                    current_mode = (await get_session_state(session_id) or {}).get("mode", mode)
                    if current_mode == "diagnostic":
                        stt_result = await transcribe_audio_full(audio_bytes, language="en", include_pronunciation_hints=True)
                        transcript = stt_result.text
                    else:
                        transcript = await transcribe_audio(audio_bytes)
                        stt_result = None
                except Exception as e:
                    await send_json(websocket, {"type": "error", "message": f"STT failed: {str(e)}"})
                    continue

                if not transcript.strip():
                    continue

                state = await get_session_state(session_id)
                if state is None:
                    break

                # Update conversation history + transcript (cap at 20 turns to avoid Redis overflow)
                state["conversation_history"].append({"role": "user", "content": transcript})
                if len(state["conversation_history"]) > 60:
                    # Keep most recent 60 turns (30 exchanges) — older context pruned to stay within Redis limits
                    state["conversation_history"] = state["conversation_history"][-60:]
                state["session_transcript"] += f"\nUser: {transcript}"
                new_turn_count = state.get("diagnostic_turn_count", 0) + 1
                state["diagnostic_turn_count"] = new_turn_count
                state["tts_is_speaking"] = True
                state["silence_timer_start"] = None

                # Store pronunciation proxy data for diagnostic scoring
                if stt_result and stt_result.pronunciation_score is not None:
                    pron_scores = state.get("pronunciation_scores", [])
                    pron_scores.append(stt_result.pronunciation_score)
                    state["pronunciation_scores"] = pron_scores

                await set_session_state(session_id, state)

                # Fire Stream B and Stream C in parallel
                await asyncio.gather(
                    handle_stream_b(websocket, session_id, transcript, state),
                    handle_stream_c(websocket, session_id, transcript, state),
                )

            elif msg_type == "interrupt":
                state = await get_session_state(session_id)
                if state:
                    state["tts_is_speaking"] = False
                    await set_session_state(session_id, state)
                await send_json(websocket, {"type": "tts_stop"})

            elif msg_type == "session_end":
                state = await get_session_state(session_id)
                if state:
                    now_iso = datetime.now(timezone.utc).isoformat()
                    supabase.table("sessions").update({
                        "ended_at": now_iso,
                        "transcript": state.get("session_transcript", ""),
                    }).eq("id", session_db_id).execute()

                    if state.get("is_diagnostic_complete"):
                        await send_json(websocket, {"type": "session_summary", "session_id": session_db_id})

                    # Update persistent user memory in the background (non-blocking)
                    session_minutes = int((time.time() - state.get("session_started_at", time.time())) / 60)
                    asyncio.create_task(update_user_memory(
                        user_id=user_id,
                        existing_memory=state.get("user_memory", {}),
                        session_transcript=state.get("session_transcript", ""),
                        session_mode=mode,
                        session_minutes=max(1, session_minutes),
                        top_errors=state.get("top_recurring_errors", []),
                    ))

                    await delete_session_state(session_id)

                break

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await send_json(websocket, {"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        nudge_task.cancel()
        # Clean up: mark session ended if still open (e.g. network drop)
        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            supabase.table("sessions").update({"ended_at": now_iso}).eq("id", session_db_id).is_("ended_at", "null").execute()
        except Exception:
            pass
        await delete_session_state(session_id)
