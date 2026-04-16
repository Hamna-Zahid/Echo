import os
import io
from groq import AsyncGroq

_client: AsyncGroq | None = None


def get_groq_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
    return _client


async def transcribe_audio(audio_bytes: bytes, language: str = "en") -> str:
    """
    Send raw audio bytes to Groq Whisper Large-v3 and return transcript.
    Audio bytes should be in webm/opus or wav format from the mobile client.
    Target latency: < 200ms for typical 5-10s utterances.
    """
    client = get_groq_client()

    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.webm"

    transcription = await client.audio.transcriptions.create(
        file=audio_file,
        model="whisper-large-v3",
        language=language,
        response_format="text",
    )

    # response_format="text" returns a plain string directly
    if isinstance(transcription, str):
        return transcription.strip()
    return transcription.text.strip()
