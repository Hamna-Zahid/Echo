import json
import os
from typing import AsyncGenerator

from groq import AsyncGroq

_client: AsyncGroq | None = None

CONVERSATION_MODEL = "llama3-8b-8192"
DIAGNOSTIC_MODEL = "llama3-70b-8192"


def get_groq_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
    return _client


async def stream_conversation(
    system_prompt: str,
    user_message: str,
    state: dict,
) -> AsyncGenerator[str, None]:
    """
    Stream Llama 3 8B tokens for conversation response.
    Target: < 200ms first token.
    Never buffer the full response before yielding.
    """
    client = get_groq_client()

    history = state.get("conversation_history", [])
    messages = [{"role": "system", "content": system_prompt}]

    # Include recent conversation history (last 6 turns to keep context tight)
    for turn in history[-6:]:
        messages.append({"role": turn["role"], "content": turn["content"]})

    # Append current user message if not already last in history
    if not history or history[-1]["role"] != "user":
        messages.append({"role": "user", "content": user_message})

    try:
        stream = await client.chat.completions.create(
            model=CONVERSATION_MODEL,
            messages=messages,
            stream=True,
            max_tokens=150,  # Keep responses short for low latency
            temperature=0.7,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content
    except Exception as e:
        yield f"I'm sorry, I had a brief connection issue. Could you repeat that?"


async def stream_diagnostic_score(transcript: str) -> dict | None:
    """
    Use Llama 3 70B to produce IELTS diagnostic scoring JSON.
    Only called once after 3 diagnostic turns.
    """
    from prompts.diagnostic import DIAGNOSTIC_SYSTEM

    client = get_groq_client()

    try:
        response = await client.chat.completions.create(
            model=DIAGNOSTIC_MODEL,
            messages=[
                {"role": "system", "content": DIAGNOSTIC_SYSTEM},
                {"role": "user", "content": f"Here is the full transcript of the 3-turn assessment:\n\n{transcript}\n\nProvide the JSON assessment now."},
            ],
            stream=False,
            max_tokens=500,
            temperature=0.1,  # Low temp for consistent scoring
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        return None


async def stream_correction_check(utterance: str) -> dict | None:
    """
    Fast grammar check using Llama 3 8B.
    Must complete within 500ms budget (Stream C).
    Returns None on timeout or error — never blocks Stream B.
    """
    from prompts.correction import CORRECTION_SYSTEM

    client = get_groq_client()

    try:
        response = await client.chat.completions.create(
            model=CONVERSATION_MODEL,
            messages=[
                {"role": "system", "content": CORRECTION_SYSTEM},
                {"role": "user", "content": utterance},
            ],
            stream=False,
            max_tokens=120,
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        return json.loads(content)
    except Exception:
        return None
