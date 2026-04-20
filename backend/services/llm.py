"""
LLM service — Groq API wrapper.

Model routing:
  Conversation    → llama-3.1-8b-instant   (lowest latency, < 150ms first token target)
  Correction      → gemma2-9b-it           (best instruction following for JSON output)
  Diagnostic score→ llama-3.3-70b-versatile (best accuracy for rubric-grounded scoring)

All streaming responses yield tokens immediately — never buffer.
Non-streaming calls (correction, diagnostic) are fire-and-forget with tight timeouts.
"""

import json
import os
from typing import AsyncGenerator

from groq import AsyncGroq

_client: AsyncGroq | None = None

# ── Model selection ──────────────────────────────────────────────────────────
CONVERSATION_MODEL = "llama-3.1-8b-instant"     # ~100ms first token on Groq
CORRECTION_MODEL   = "gemma2-9b-it"              # excellent JSON instruction following
DIAGNOSTIC_MODEL   = "llama-3.3-70b-versatile"  # highest accuracy for scoring

# Fallback models if primary quota exceeded
CONVERSATION_FALLBACK = "llama3-8b-8192"
CORRECTION_FALLBACK   = "llama3-8b-8192"


def get_groq_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
    return _client


# ── Stream B: Conversation ───────────────────────────────────────────────────

async def stream_conversation(
    system_prompt: str,
    user_message: str,
    state: dict,
) -> AsyncGenerator[str, None]:
    """
    Stream Llama 3.1 8B tokens for live conversation response.
    Target: < 150ms first token.
    Yields tokens one by one — ws.py accumulates into sentence chunks for TTS.
    """
    client = get_groq_client()

    history = state.get("conversation_history", [])
    messages = [{"role": "system", "content": system_prompt}]

    # Last 8 turns (4 exchanges) — enough context, low token overhead
    for turn in history[-8:]:
        if turn.get("role") and turn.get("content"):
            messages.append({"role": turn["role"], "content": turn["content"]})

    # Append current user message if not already last
    if not history or history[-1].get("role") != "user":
        messages.append({"role": "user", "content": user_message})

    try:
        stream = await client.chat.completions.create(
            model=CONVERSATION_MODEL,
            messages=messages,
            stream=True,
            max_tokens=120,   # ~2-3 sentences — keeps TTS latency low
            temperature=0.75,
            top_p=0.9,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content

    except Exception as e:
        # Fallback: try legacy model
        try:
            stream = await client.chat.completions.create(
                model=CONVERSATION_FALLBACK,
                messages=messages,
                stream=True,
                max_tokens=120,
                temperature=0.75,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    yield delta.content
        except Exception:
            yield "I missed that — could you say that again?"


# ── Stream C: Correction check ───────────────────────────────────────────────

async def stream_correction_check(utterance: str) -> dict | None:
    """
    Grammar error check using Gemma 2 9B.
    Must complete within 500ms budget — ws.py enforces asyncio.timeout(0.5).
    Returns None on any error — never blocks Stream B.

    Uses gemma2-9b-it which consistently follows structured JSON instructions
    and has very low latency on Groq's infrastructure.
    """
    from prompts.correction import CORRECTION_SYSTEM

    client = get_groq_client()

    # Strip filler noise before sending to correction model
    clean_utterance = _preprocess_utterance(utterance)
    if not clean_utterance or len(clean_utterance.split()) < 4:
        return None  # Too short to meaningfully correct

    try:
        response = await client.chat.completions.create(
            model=CORRECTION_MODEL,
            messages=[
                {"role": "system", "content": CORRECTION_SYSTEM},
                {"role": "user", "content": clean_utterance},
            ],
            stream=False,
            max_tokens=180,
            temperature=0.05,   # Near-deterministic for consistent JSON
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        result = json.loads(content)

        # Validate schema — don't let malformed JSON crash Stream B
        if not isinstance(result, dict):
            return None
        if not result.get("error"):
            return None  # No error found — return None (not {"error": false})
        return result

    except Exception:
        # Try fallback model once
        try:
            response = await client.chat.completions.create(
                model=CORRECTION_FALLBACK,
                messages=[
                    {"role": "system", "content": CORRECTION_SYSTEM},
                    {"role": "user", "content": clean_utterance},
                ],
                stream=False,
                max_tokens=180,
                temperature=0.05,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            result = json.loads(content)
            if not result.get("error"):
                return None
            return result
        except Exception:
            return None


def _preprocess_utterance(text: str) -> str:
    """Clean Whisper transcript before sending to correction model."""
    text = text.strip()
    # Remove leading hesitation sounds that Whisper sometimes transcribes literally
    for filler in ["um,", "uh,", "hmm,", "er,"]:
        if text.lower().startswith(filler):
            text = text[len(filler):].strip()
    return text


# ── Diagnostic scoring ───────────────────────────────────────────────────────

async def stream_diagnostic_score(transcript: str) -> dict | None:
    """
    Full IELTS diagnostic scoring using Llama 3.3 70B.
    Called once after the full 5-turn diagnostic conversation.
    Uses the rubric-grounded DIAGNOSTIC_SCORING_SYSTEM prompt.
    """
    from prompts.diagnostic import DIAGNOSTIC_SCORING_SYSTEM

    client = get_groq_client()

    if not transcript or len(transcript.strip()) < 50:
        return None

    scoring_request = (
        f"Here is the full transcript of the 5-turn speaking assessment.\n\n"
        f"━━━ TRANSCRIPT ━━━\n{transcript}\n━━━ END TRANSCRIPT ━━━\n\n"
        f"Apply the IELTS band descriptors precisely. Score each criterion independently. "
        f"Return the JSON assessment now."
    )

    try:
        response = await client.chat.completions.create(
            model=DIAGNOSTIC_MODEL,
            messages=[
                {"role": "system", "content": DIAGNOSTIC_SCORING_SYSTEM},
                {"role": "user", "content": scoring_request},
            ],
            stream=False,
            max_tokens=600,
            temperature=0.1,   # Low temperature = consistent, rubric-anchored scores
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        result = json.loads(content)

        # Validate required fields
        required = ["cefr_level", "ielts_equivalent", "fluency", "lexical", "grammar", "pronunciation"]
        if not all(k in result for k in required):
            return None

        # Clamp scores to valid IELTS range
        for field in ["ielts_equivalent", "fluency", "lexical", "grammar", "pronunciation"]:
            if field in result:
                result[field] = max(0.0, min(9.0, float(result[field])))

        return result

    except Exception:
        return None


# ── Vocabulary enhancement (optional — used by training mode) ────────────────

async def get_vocabulary_suggestion(phrase: str, cefr_target: str = "B2") -> str | None:
    """
    Suggest a more sophisticated vocabulary alternative for a given phrase.
    Used to progressively upgrade user vocabulary during training mode.
    Not in the critical path — called async fire-and-forget.
    """
    client = get_groq_client()
    prompt = (
        f"A {cefr_target}-level English learner said: \"{phrase}\"\n"
        f"Suggest ONE more sophisticated but natural vocabulary alternative suitable for {cefr_target}+.\n"
        f"Reply in JSON: {{\"original\": \"...\", \"upgrade\": \"...\", \"example\": \"...\"}}"
    )
    try:
        response = await client.chat.completions.create(
            model=CORRECTION_MODEL,
            messages=[{"role": "user", "content": prompt}],
            stream=False,
            max_tokens=80,
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return None
