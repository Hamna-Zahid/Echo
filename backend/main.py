import os
import sys
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

load_dotenv()

from routers import auth, sessions, ws, echo
from db.supabase import init_supabase


def _validate_env():
    dev_tts = os.environ.get("DEV_TTS", "edge").lower()

    required = {
        "OPENAI_API_KEY":            "Get from platform.openai.com → API Keys",
        "GROQ_API_KEY":              "Get free key at console.groq.com (used for Whisper STT)",
        "SUPABASE_URL":              "Get from supabase.com → project → Settings → API",
        "SUPABASE_ANON_KEY":         "Get from supabase.com → project → Settings → API",
        "SUPABASE_SERVICE_ROLE_KEY": "Get from supabase.com → project → Settings → API",
        "REDIS_URL":                 "Get from console.upstash.com (free tier)",
    }

    if dev_tts == "cartesia":
        required["CARTESIA_API_KEY"]           = "Get from play.cartesia.ai"
        required["CARTESIA_VOICE_ID_AMERICAN"] = "Pick a voice ID from Cartesia voice library"

    missing = [
        f"  {var}  ← {hint}"
        for var, hint in required.items()
        if not os.environ.get(var)
    ]

    if missing:
        print("\n" + "═" * 60)
        print("  EchoCoach: missing required environment variables")
        print("═" * 60)
        for m in missing:
            print(m)
        print(f"\n  Copy .env.example → .env and fill in the values.")
        print(f"  Current DEV_TTS mode: {dev_tts}")
        print("═" * 60 + "\n")
        sys.exit(1)

    if dev_tts == "edge":
        print("[EchoCoach] TTS mode: edge-tts (FREE — Microsoft Edge Neural voices)")
    elif dev_tts == "silent":
        print("[EchoCoach] TTS mode: silent (no audio — AI logic testing only)")
    else:
        print("[EchoCoach] TTS mode: Cartesia Sonic (production)")


_validate_env()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_supabase()
    yield


app = FastAPI(
    title="EchoCoach API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/auth",     tags=["auth"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(echo.router,     tags=["echo-test"])
app.include_router(ws.router,       tags=["websocket"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "EchoCoach API"}
