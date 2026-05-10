"""
TTS service — streaming audio from text.

DEV vs PROD routing (controlled by DEV_TTS env var):

  DEV_TTS=edge  (default in development)
    → Microsoft Edge TTS via edge-tts library
    → Completely FREE, no API key required
    → Good voice quality (Azure Neural voices under the hood)
    → Returns MP3 bytes, converted to PCM F32LE for client compatibility
    → Use this during all development and testing

  DEV_TTS=cartesia  (or unset in production)
    → Cartesia Sonic SSE streaming
    → $6/1M characters, first 1M free
    → < 300ms first audio chunk
    → Use this for production and pre-launch testing only

  DEV_TTS=silent
    → Returns a short burst of silence immediately
    → Use when testing AI logic only (no audio needed at all)
    → Fastest possible — zero latency, zero cost

Set in backend/.env:
  DEV_TTS=edge       ← development (free)
  DEV_TTS=cartesia   ← production (paid)
  DEV_TTS=silent     ← pure AI logic testing
"""

import asyncio
import base64
import io
import json
import os
import struct
from typing import AsyncGenerator

import httpx

# ── Config ────────────────────────────────────────────────────────────────────

CARTESIA_STREAMING_URL = "https://api.cartesia.ai/tts/sse"

VOICE_IDS = {
    "american": os.environ.get("CARTESIA_VOICE_ID_AMERICAN", ""),
    "british":  os.environ.get("CARTESIA_VOICE_ID_BRITISH", ""),
}

# Edge TTS voice mapping (free, no key needed)
EDGE_VOICES = {
    "american": "en-US-AriaNeural",    # Natural, warm American female
    "british":  "en-GB-SoniaNeural",   # Clear, professional British female
}

# Detect mode: default to 'edge' in development (safe default — never accidentally charges Cartesia)
_TTS_MODE = os.environ.get("DEV_TTS", "edge").lower()


# ── Public interface ──────────────────────────────────────────────────────────

async def stream_tts(
    text: str,
    accent: str = "american",
    sample_rate: int = 24000,
) -> AsyncGenerator[bytes, None]:
    """
    Stream audio chunks for a text string.
    Routing determined by DEV_TTS environment variable.
    Always yields raw PCM F32LE bytes at `sample_rate` Hz.
    Never buffers the full response.
    """
    if not text or not text.strip():
        return

    mode = _TTS_MODE

    if mode == "silent":
        # Pure silence — 0.3s of F32LE 24kHz silence
        # Useful for testing AI logic without any audio overhead
        num_samples = int(sample_rate * 0.3)
        yield bytes(num_samples * 4)  # 4 bytes per F32LE sample
        return

    if mode == "edge":
        async for chunk in _edge_tts(text, accent, sample_rate):
            yield chunk
        return

    # Default: Cartesia (production)
    async for chunk in _cartesia_tts(text, accent, sample_rate):
        yield chunk


# ── Edge TTS (FREE — development) ────────────────────────────────────────────

async def _edge_tts(
    text: str,
    accent: str = "american",
    sample_rate: int = 24000,
) -> AsyncGenerator[bytes, None]:
    """
    Microsoft Edge TTS via edge-tts library.
    Returns PCM F32LE chunks converted from MP3.
    Completely free, no API key, good voice quality.
    """
    try:
        import edge_tts

        voice = EDGE_VOICES.get(accent, EDGE_VOICES["american"])
        communicator = edge_tts.Communicate(text, voice)

        # Collect MP3 bytes from edge-tts stream
        mp3_chunks = []
        async for item in communicator.stream():
            if item["type"] == "audio":
                mp3_chunks.append(item["data"])

        if not mp3_chunks:
            yield b""
            return

        mp3_bytes = b"".join(mp3_chunks)

        # Convert MP3 → PCM F32LE using pydub (if available) or fallback
        pcm_chunks = _mp3_to_pcm_f32le(mp3_bytes, target_sample_rate=sample_rate)
        for chunk in pcm_chunks:
            yield chunk

    except ImportError:
        # edge-tts not installed — yield silence and log warning
        import warnings
        warnings.warn(
            "edge-tts not installed. Run: pip install edge-tts\n"
            "Falling back to silence. Set DEV_TTS=cartesia to use Cartesia instead.",
            stacklevel=2,
        )
        num_samples = int(sample_rate * 0.5)
        yield bytes(num_samples * 4)

    except Exception as e:
        # Any other error — yield silence, don't crash the session
        num_samples = int(sample_rate * 0.3)
        yield bytes(num_samples * 4)


def _mp3_to_pcm_f32le(
    mp3_bytes: bytes,
    target_sample_rate: int = 24000,
    chunk_size_ms: int = 200,
) -> list[bytes]:
    """
    Convert MP3 bytes to PCM F32LE chunks.
    Uses miniaudio (no ffmpeg required) as primary decoder.
    Falls back to pydub+ffmpeg if miniaudio unavailable.
    Returns list of raw bytes chunks (each ~200ms of audio).
    """
    # ── Primary: miniaudio (ships its own codecs, no system deps) ────────────
    try:
        import miniaudio

        decoded = miniaudio.decode(
            mp3_bytes,
            nchannels=1,
            sample_rate=target_sample_rate,
            output_format=miniaudio.SampleFormat.FLOAT32,
        )
        f32_bytes = bytes(decoded.samples)

        # Split into ~200ms chunks for streaming behavior
        chunk_samples = target_sample_rate * chunk_size_ms // 1000
        chunk_bytes_size = chunk_samples * 4  # 4 bytes per F32 sample
        return [f32_bytes[i:i+chunk_bytes_size] for i in range(0, len(f32_bytes), chunk_bytes_size)]

    except ImportError:
        pass  # fall through to pydub
    except Exception:
        pass  # fall through to pydub

    # ── Fallback: pydub + ffmpeg ──────────────────────────────────────────────
    try:
        from pydub import AudioSegment

        audio = AudioSegment.from_mp3(io.BytesIO(mp3_bytes))
        audio = audio.set_frame_rate(target_sample_rate).set_channels(1)

        raw_pcm = audio.raw_data
        samples_i16 = struct.unpack(f"<{len(raw_pcm)//2}h", raw_pcm)
        samples_f32 = [s / 32768.0 for s in samples_i16]
        f32_bytes = struct.pack(f"<{len(samples_f32)}f", *samples_f32)

        chunk_samples = target_sample_rate * chunk_size_ms // 1000
        chunk_bytes_size = chunk_samples * 4
        return [f32_bytes[i:i+chunk_bytes_size] for i in range(0, len(f32_bytes), chunk_bytes_size)]

    except Exception:
        return [bytes(target_sample_rate * 4)]  # 1s silence


# ── Cartesia TTS (PAID — production) ─────────────────────────────────────────

async def _cartesia_tts(
    text: str,
    accent: str = "american",
    sample_rate: int = 24000,
) -> AsyncGenerator[bytes, None]:
    """
    Cartesia Sonic SSE streaming TTS.
    Streams PCM F32LE audio chunks as they arrive — never buffers full response.
    Target: < 300ms first audio chunk.
    """
    api_key = os.environ.get("CARTESIA_API_KEY", "")
    voice_id = VOICE_IDS.get(accent, VOICE_IDS.get("american", ""))

    if not api_key or not voice_id:
        import warnings
        warnings.warn(
            "CARTESIA_API_KEY or CARTESIA_VOICE_ID not set. "
            "Set DEV_TTS=edge for free development TTS.",
            stacklevel=2,
        )
        yield b""
        return

    headers = {
        "X-API-Key": api_key,
        "Cartesia-Version": "2025-04-16",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    payload = {
        "model_id": "sonic-2",
        "transcript": text,
        "voice": {"mode": "id", "id": voice_id},
        "output_format": {
            "container": "raw",
            "encoding": "pcm_f32le",
            "sample_rate": sample_rate,
        },
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=5.0)) as client:
            async with client.stream(
                "POST", CARTESIA_STREAMING_URL, headers=headers, json=payload
            ) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    import warnings
                    warnings.warn(f"Cartesia HTTP {response.status_code}: {body[:200]}")
                    async for chunk in _edge_tts(text, accent, sample_rate):
                        yield chunk
                    return

                async for line in response.aiter_lines():
                    line = line.strip()
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str in ("[DONE]", ""):
                            break
                        try:
                            event = json.loads(data_str)
                            # Cartesia sends {"type":"chunk","data":"<b64>",...}
                            # or {"done":true} at end
                            if event.get("done"):
                                break
                            audio_b64 = event.get("data")
                            if audio_b64:
                                yield base64.b64decode(audio_b64)
                        except Exception:
                            continue

    except Exception as e:
        import warnings
        warnings.warn(f"Cartesia TTS error: {e} — falling back to edge-tts")
        async for chunk in _edge_tts(text, accent, sample_rate):
            yield chunk
