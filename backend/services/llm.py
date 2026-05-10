"""
LLM service — OpenAI GPT-4o primary, Groq fallback.

Model routing:
  Conversation    → gpt-4o               (best instruction following, nuanced conversation)
  Correction      → gpt-4o-mini          (fast + cheap JSON, reliable schema adherence)
  Diagnostic      → gpt-4o               (best rubric-grounded scoring accuracy)

Groq (llama-3.3-70b-versatile) is kept as a silent fallback for all calls
in case OpenAI quota or connectivity fails — session never drops.

STT is handled separately in stt.py (Groq Whisper — stays unchanged).
"""

import json
import os
from typing import AsyncGenerator

from openai import AsyncOpenAI
from groq import AsyncGroq

# ── Clients (lazy-initialised) ────────────────────────────────────────────────
_openai_client: AsyncOpenAI | None = None
_groq_client: AsyncGroq | None = None


def get_openai_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _openai_client


def get_groq_client() -> AsyncGroq:
    global _groq_client
    if _groq_client is None:
        _groq_client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
    return _groq_client


# ── Model selection ───────────────────────────────────────────────────────────
CONVERSATION_MODEL  = "gpt-4o"        # primary: best conversational intelligence
CORRECTION_MODEL    = "gpt-4o-mini"   # fast + cheap for JSON correction schema
DIAGNOSTIC_MODEL    = "gpt-4o"        # best for rubric-grounded IELTS scoring

GROQ_FALLBACK_CONV  = "llama-3.3-70b-versatile"
GROQ_FALLBACK_FAST  = "llama-3.1-8b-instant"


# ── Stream B: Conversation ────────────────────────────────────────────────────

async def stream_conversation(
    system_prompt: str,
    user_message: str,
    state: dict,
) -> AsyncGenerator[str, None]:
    """
    Stream GPT-4o tokens for live conversation response.
    Full session history passed so the model never repeats a question.
    Falls back to Groq llama-3.3-70b if OpenAI is unavailable.
    """
    history = state.get("conversation_history", [])

    messages = [{"role": "system", "content": system_prompt}]

    # Full session history (capped at 40 turns = 20 exchanges)
    for turn in history[-40:]:
        if turn.get("role") and turn.get("content"):
            messages.append({"role": turn["role"], "content": turn["content"]})

    # Add current user message if not already the last item in history
    if not history or history[-1].get("role") != "user":
        messages.append({"role": "user", "content": user_message})

    # ── Primary: GPT-4o ──────────────────────────────────────────────────────
    try:
        client = get_openai_client()
        stream = await client.chat.completions.create(
            model=CONVERSATION_MODEL,
            messages=messages,
            stream=True,
            max_tokens=160,
            temperature=0.8,
            top_p=0.95,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content
        return

    except Exception:
        pass  # fall through to Groq

    # ── Fallback: Groq llama-3.3-70b ─────────────────────────────────────────
    try:
        groq = get_groq_client()
        stream = await groq.chat.completions.create(
            model=GROQ_FALLBACK_CONV,
            messages=messages,
            stream=True,
            max_tokens=160,
            temperature=0.8,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content

    except Exception:
        yield "I missed that — could you say that again?"


# ── Stream C: Correction check ────────────────────────────────────────────────

async def stream_correction_check(utterance: str) -> dict | None:
    """
    Grammar/error check using GPT-4o-mini.
    Must complete within 500ms budget (enforced by ws.py asyncio.timeout).
    Returns None on any error — never blocks Stream B.
    """
    from prompts.correction import CORRECTION_SYSTEM

    clean = _preprocess_utterance(utterance)
    if not clean or len(clean.split()) < 4:
        return None

    # ── Primary: GPT-4o-mini ─────────────────────────────────────────────────
    try:
        client = get_openai_client()
        response = await client.chat.completions.create(
            model=CORRECTION_MODEL,
            messages=[
                {"role": "system", "content": CORRECTION_SYSTEM},
                {"role": "user", "content": clean},
            ],
            stream=False,
            max_tokens=200,
            temperature=0.0,
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        if not isinstance(result, dict) or not result.get("error"):
            return None
        return result

    except Exception:
        pass

    # ── Fallback: Groq 8B ────────────────────────────────────────────────────
    try:
        groq = get_groq_client()
        response = await groq.chat.completions.create(
            model=GROQ_FALLBACK_FAST,
            messages=[
                {"role": "system", "content": CORRECTION_SYSTEM},
                {"role": "user", "content": clean},
            ],
            stream=False,
            max_tokens=200,
            temperature=0.0,
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        if not isinstance(result, dict) or not result.get("error"):
            return None
        return result

    except Exception:
        return None


# ── Diagnostic scoring ────────────────────────────────────────────────────────

async def stream_diagnostic_score(transcript: str) -> dict | None:
    """
    Full IELTS diagnostic scoring using GPT-4o.
    Called once after the full 5-turn diagnostic conversation.
    """
    from prompts.diagnostic import DIAGNOSTIC_SCORING_SYSTEM

    if not transcript or len(transcript.strip()) < 50:
        return None

    scoring_request = (
        f"Here is the full transcript of the 5-turn speaking assessment.\n\n"
        f"━━━ TRANSCRIPT ━━━\n{transcript}\n━━━ END TRANSCRIPT ━━━\n\n"
        f"Apply the IELTS band descriptors precisely. Score each criterion independently. "
        f"Return the JSON assessment now."
    )

    # ── Primary: GPT-4o ──────────────────────────────────────────────────────
    try:
        client = get_openai_client()
        response = await client.chat.completions.create(
            model=DIAGNOSTIC_MODEL,
            messages=[
                {"role": "system", "content": DIAGNOSTIC_SCORING_SYSTEM},
                {"role": "user", "content": scoring_request},
            ],
            stream=False,
            max_tokens=600,
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        return _validate_diagnostic(result)

    except Exception:
        pass

    # ── Fallback: Groq 70B ───────────────────────────────────────────────────
    try:
        groq = get_groq_client()
        response = await groq.chat.completions.create(
            model=GROQ_FALLBACK_CONV,
            messages=[
                {"role": "system", "content": DIAGNOSTIC_SCORING_SYSTEM},
                {"role": "user", "content": scoring_request},
            ],
            stream=False,
            max_tokens=600,
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        return _validate_diagnostic(result)

    except Exception:
        return None


def _validate_diagnostic(result: dict) -> dict | None:
    required = ["cefr_level", "ielts_equivalent", "fluency", "lexical", "grammar", "pronunciation"]
    if not all(k in result for k in required):
        return None
    for field in ["ielts_equivalent", "fluency", "lexical", "grammar", "pronunciation"]:
        if field in result:
            result[field] = max(0.0, min(9.0, float(result[field])))
    return result


# ── Memory insight extraction ─────────────────────────────────────────────────

async def extract_session_insights(transcript: str, top_errors: list) -> dict | None:
    """
    Extract structured learning insights from a session transcript.
    Called by memory.py after session ends — non-blocking background task.
    """
    prompt = f"""Analyse this English coaching session transcript and extract learning insights about the student.

TRANSCRIPT:
{transcript[:3000]}

TOP ERRORS THIS SESSION:
{json.dumps([e.get('error_type', '') for e in top_errors[:5]])}

Return ONLY a JSON object (all keys optional — include only where you have clear evidence):
{{
  "mastered": ["..."],
  "persistent_struggles": ["..."],
  "preferred_topics": ["..."],
  "personality_notes": "...",
  "last_session_summary": "..."
}}

Be specific: "subject-verb agreement" not "grammar". Max 3 items per list.
personality_notes: one sentence about how they respond, their pace, confidence.
last_session_summary: 1-2 sentences on what was worked on and notable progress."""

    try:
        client = get_openai_client()
        response = await client.chat.completions.create(
            model=CORRECTION_MODEL,  # gpt-4o-mini — cheap and sufficient
            messages=[{"role": "user", "content": prompt}],
            stream=False,
            max_tokens=300,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        pass

    # Groq fallback
    try:
        groq = get_groq_client()
        response = await groq.chat.completions.create(
            model=GROQ_FALLBACK_FAST,
            messages=[{"role": "user", "content": prompt}],
            stream=False,
            max_tokens=300,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _preprocess_utterance(text: str) -> str:
    """Strip leading filler sounds that Whisper sometimes transcribes literally."""
    text = text.strip()
    for filler in ["um,", "uh,", "hmm,", "er,"]:
        if text.lower().startswith(filler):
            text = text[len(filler):].strip()
    return text
