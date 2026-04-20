import os
import sys
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from routers import auth, sessions, ws, echo
from db.supabase import init_supabase


def _validate_env():
    """
    Validate required environment variables at startup.
    Fail fast with a clear message rather than letting the first user session crash.
    """
    dev_tts = os.environ.get("DEV_TTS", "edge").lower()

    required = {
        "GROQ_API_KEY":            "Get free key at console.groq.com",
        "SUPABASE_URL":            "Get from supabase.com → project → Settings → API",
        "SUPABASE_ANON_KEY":       "Get from supabase.com → project → Settings → API",
        "SUPABASE_SERVICE_ROLE_KEY": "Get from supabase.com → project → Settings → API",
        "REDIS_URL":               "Get from console.upstash.com (free tier)",
    }

    # Cartesia only required in production
    if dev_tts == "cartesia":
        required["CARTESIA_API_KEY"] = "Get from play.cartesia.ai"
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
        print()
        print(f"  Copy .env.example → .env and fill in the values.")
        print(f"  Current DEV_TTS mode: {dev_tts}")
        print("═" * 60 + "\n")
        sys.exit(1)

    # Warn about optional but useful vars
    if dev_tts == "edge":
        print(f"[EchoCoach] TTS mode: edge-tts (FREE — Microsoft Edge Neural voices)")
    elif dev_tts == "silent":
        print(f"[EchoCoach] TTS mode: silent (no audio — AI logic testing only)")
    else:
        print(f"[EchoCoach] TTS mode: Cartesia Sonic (production)")


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


# ── CORS ─────────────────────────────────────────────────────────────────────
# NOTE: allow_credentials=True is INCOMPATIBLE with allow_origins=["*"] in
# Starlette 1.0 (it rejects WebSocket upgrades). Auth is handled via JWT in
# query params / Authorization header — we don't need cookie credentials here.
from starlette.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
# echo MUST be before ws — /ws/echo would otherwise match /ws/{session_id}
app.include_router(echo.router, tags=["echo-test"])
app.include_router(ws.router, tags=["websocket"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "EchoCoach API"}
