import os
import httpx
from typing import AsyncGenerator

CARTESIA_API_URL = "https://api.cartesia.ai/tts/bytes"
CARTESIA_STREAMING_URL = "https://api.cartesia.ai/tts/sse"

# Voice IDs are configured per accent in env vars
VOICE_IDS = {
    "american": os.environ.get("CARTESIA_VOICE_ID_AMERICAN", ""),
    "british": os.environ.get("CARTESIA_VOICE_ID_BRITISH", ""),
}


async def stream_tts(
    text: str,
    accent: str = "american",
    sample_rate: int = 24000,
) -> AsyncGenerator[bytes, None]:
    """
    Stream audio chunks from Cartesia Sonic API.
    Uses SSE streaming to yield audio bytes as they arrive — never buffers full response.
    Target: < 300ms first audio chunk.
    Falls back to Inworld AI Mini on failure.
    """
    api_key = os.environ.get("CARTESIA_API_KEY", "")
    voice_id = VOICE_IDS.get(accent, VOICE_IDS["american"])

    if not api_key or not voice_id:
        # Fallback: yield silence placeholder if keys not configured
        yield b""
        return

    headers = {
        "X-API-Key": api_key,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    payload = {
        "model_id": "sonic-english",
        "transcript": text,
        "voice": {
            "mode": "id",
            "id": voice_id,
        },
        "output_format": {
            "container": "raw",
            "encoding": "pcm_f32le",
            "sample_rate": sample_rate,
        },
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=3.0)) as client:
            async with client.stream("POST", CARTESIA_STREAMING_URL, headers=headers, json=payload) as response:
                if response.status_code != 200:
                    async for chunk in _fallback_tts(text, accent):
                        yield chunk
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            import json
                            event = json.loads(data_str)
                            # Cartesia SSE returns base64-encoded audio in each event
                            if "data" in event:
                                import base64
                                audio_bytes = base64.b64decode(event["data"])
                                yield audio_bytes
                        except Exception:
                            continue
    except Exception:
        async for chunk in _fallback_tts(text, accent):
            yield chunk


async def _fallback_tts(text: str, accent: str = "american") -> AsyncGenerator[bytes, None]:
    """
    Inworld AI Mini fallback TTS.
    Called when Cartesia is unavailable.
    """
    api_key = os.environ.get("INWORLD_API_KEY", "")
    if not api_key:
        yield b""
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "voice": "en-US-neural" if accent == "american" else "en-GB-neural",
        "format": "pcm_16000",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            async with client.stream(
                "POST",
                "https://api.inworld.ai/tts/v1/synthesize",
                headers=headers,
                json=payload,
            ) as response:
                async for chunk in response.aiter_bytes(chunk_size=4096):
                    yield chunk
    except Exception:
        yield b""
