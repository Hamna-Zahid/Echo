# EchoCoach

Voice-first AI English coaching app for IELTS Band 7+ and professional interview preparation.

## Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo (managed → bare) |
| Backend | FastAPI (Python 3.11) + async WebSockets |
| STT | Groq Whisper Large-v3 |
| LLM | Groq Llama 3 8B (conversation) + 70B (diagnostic) |
| TTS | Cartesia Sonic streaming (primary) + Inworld fallback |
| Audio | LiveKit WebRTC |
| VAD | Silero VAD via ONNX Runtime (on-device) |
| State | Redis (Upstash) |
| DB + Auth | Supabase (PostgreSQL + RLS) |
| Hosting | Railway.app |

## Latency targets

| Stage | Target |
|-------|--------|
| Silero VAD end-of-speech | 0ms (on-device) |
| Audio transmission | < 50ms |
| Groq Whisper STT | < 200ms |
| Groq Llama 3 8B first token | < 200ms |
| Cartesia first audio chunk | < 300ms |
| **Total user→AI first word** | **< 750ms** |

---

## Setup

### 1. Clone and configure

```bash
git clone <repo>
cd echocoach
cp .env.example .env
# Fill in all values in .env
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/health` → `{"status":"ok"}`

### 3. Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Open SQL Editor and run `backend/db/schema.sql`
3. Copy your project URL and keys to `.env`

### 4. Redis

1. Create a free database at [console.upstash.com](https://console.upstash.com)
2. Copy REST URL and token to `.env`

### 5. Mobile

```bash
cd mobile
npm install
npx expo start
```

Press `a` for Android or `i` for iOS. Requires Expo Go or a development build.

For on-device VAD (Silero ONNX):
```bash
# Download model
curl -L https://github.com/snakers4/silero-vad/raw/master/files/silero_vad.onnx \
  -o mobile/assets/silero_vad.onnx
```

### 6. Deploy backend to Railway

```bash
npm install -g railway
railway login
railway init
railway up
```

Set all env vars in Railway dashboard → Variables.

---

## Build Order

Follow these steps in sequence — each must pass before moving to the next:

1. FastAPI `/health` endpoint
2. WebSocket echo test
3. Groq STT integration
4. Groq LLM streaming
5. Cartesia TTS streaming
6. Full synchronous pipeline (3→4→5)
7. Streaming optimization + latency measurement
8. Redis session state
9. Supabase schema + auth
10. React Native scaffold
11. LiveKit audio room
12. Silero VAD on client
13. Interruption handling
14. Dual-stream (correction cards)
15. Diagnostic mode
16. Training mode with personalization
17. UI polish

---

## Project Structure

```
echocoach/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── routers/
│   │   ├── ws.py                # WebSocket handler (main session logic)
│   │   ├── auth.py              # Supabase auth endpoints
│   │   └── sessions.py          # Session history REST endpoints
│   ├── services/
│   │   ├── stt.py               # Groq Whisper STT
│   │   ├── llm.py               # LLM service (8B + 70B)
│   │   ├── tts.py               # Cartesia streaming TTS
│   │   ├── correction.py        # Parallel error-checking
│   │   └── redis_state.py       # Session state R/W
│   ├── prompts/
│   │   ├── diagnostic.py        # IELTS diagnostic prompt + schema
│   │   ├── training.py          # Training mode prompt builder
│   │   ├── correction.py        # Grammar correction prompt
│   │   └── interview.py         # Interview mode / STAR prompt
│   ├── models/
│   │   ├── session.py           # Session state Pydantic model
│   │   └── correction.py        # Correction card Pydantic model
│   ├── db/
│   │   ├── schema.sql           # Full Supabase schema + RLS
│   │   └── supabase.py          # Supabase client wrapper
│   └── requirements.txt
├── mobile/
│   ├── app/
│   │   ├── (auth)/login.tsx
│   │   ├── (auth)/register.tsx
│   │   ├── (app)/index.tsx      # Home / mode selector
│   │   ├── (app)/session.tsx    # Live session screen
│   │   ├── (app)/history.tsx    # Progress dashboard
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── WaveformVisualizer.tsx
│   │   ├── CorrectionCard.tsx
│   │   ├── SessionTimer.tsx
│   │   └── ModeSelector.tsx
│   ├── hooks/
│   │   ├── useVAD.ts
│   │   ├── useWebSocket.ts
│   │   ├── useLiveKit.ts
│   │   └── useSession.ts
│   ├── services/
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── constants/prompts.ts
│   └── package.json
├── .env.example
└── README.md
```

---

## Testing Checkpoints

### Phase 1 — The Loop
- [ ] User speaks → AI responds → audio plays within 1.5s on real Android
- [ ] User speaks over AI → AI stops immediately
- [ ] 10 consecutive turns, no crash or memory leak

### Phase 2 — The Evaluator
- [ ] Correction card appears while AI audio is still playing
- [ ] Diagnostic JSON matches expected CEFR band for 3 test samples
- [ ] Errors written to Supabase `errors` table with correct schema

### Phase 3 — The UI
- [ ] Mode selector routes to correct system prompt
- [ ] Waveform animates in all 3 states (idle / user / AI)
- [ ] Correction cards stack and auto-dismiss correctly

### Phase 4 — The Memory
- [ ] AI surfaces past error in first 5 minutes of session 4+
- [ ] `recurrence_count` increments correctly on repeat errors
- [ ] Session summary displays correct scores and error count
