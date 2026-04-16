import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from routers import auth, sessions, ws, echo
from db.supabase import init_supabase


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
