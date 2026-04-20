"""
Training mode prompt builder.

Principles:
  - CEFR-level-specific conversation tasks (not generic "talk about anything")
  - Strategically surfaces the user's top recurring error patterns
  - Adjusts vocabulary complexity, question depth, and expected response length per level
  - Never breaks conversational immersion to correct — correction is Stream C's job
  - 40-word response cap for low latency TTS pipeline
"""

from typing import Optional


# ── CEFR-level configurations ────────────────────────────────────────────────

CEFR_PROFILES = {
    "A1": {
        "description": "beginner",
        "task_types": [
            "Ask about their name, age, family, and where they live.",
            "Ask what they do every day (simple present routine).",
            "Ask what they like and dislike (food, colors, sports).",
        ],
        "response_length_guide": "Keep your sentences very short (5–8 words). One idea per sentence.",
        "complexity": "Use only common everyday vocabulary. No idioms.",
        "probe": "Can you say more? For example?",
    },
    "A2": {
        "description": "elementary",
        "task_types": [
            "Ask about their job or studies in simple terms.",
            "Ask them to describe their home town or neighborhood.",
            "Ask about a recent weekend or holiday.",
        ],
        "response_length_guide": "Use short sentences linked with 'and', 'but', 'because'.",
        "complexity": "Use common vocabulary. Introduce phrasal verbs gently.",
        "probe": "Can you tell me a bit more about that?",
    },
    "B1": {
        "description": "intermediate",
        "task_types": [
            "Ask them to compare two things (e.g. city vs. village life).",
            "Ask about a goal they are working towards.",
            "Ask them to explain why they made an important decision.",
            "Ask them to describe a challenge they faced and how they handled it.",
        ],
        "response_length_guide": "Aim for 3–5 connected sentences. Use connectors: however, although, as a result.",
        "complexity": "Introduce abstract nouns, reported speech, modal verbs for advice.",
        "probe": "That's interesting — can you give me a specific example of that?",
    },
    "B2": {
        "description": "upper-intermediate",
        "task_types": [
            "Ask for their opinion on a social or professional issue with reasons.",
            "Ask them to describe a complex situation and analyse what went wrong or right.",
            "Ask them to compare approaches to a problem and recommend one.",
            "Ask a hypothetical: 'If you could change one thing about your industry, what would it be?'",
        ],
        "response_length_guide": "Expect 5–8 connected sentences. Push for elaboration and evidence.",
        "complexity": "Expect conditional structures, passive voice, complex clauses.",
        "probe": "Could you develop that further? What evidence supports that view?",
    },
    "C1": {
        "description": "advanced",
        "task_types": [
            "Discuss the implications of a current trend in their field.",
            "Ask them to argue both sides of a controversial topic, then take a stance.",
            "Ask them to speculate about future developments in their area of interest.",
            "Ask about a time they had to persuade someone and what strategies they used.",
        ],
        "response_length_guide": "Expect extended, nuanced answers with hedging and qualification.",
        "complexity": "Expect idiomatic language, academic vocabulary, sophisticated argument structure.",
        "probe": "That's a strong point — can you qualify that or acknowledge a counter-argument?",
    },
    "C2": {
        "description": "proficiency",
        "task_types": [
            "Explore a nuanced ethical dilemma relevant to their work or studies.",
            "Ask them to critically analyse a recent event or decision.",
            "Discuss the tension between two competing values (e.g. efficiency vs. equity).",
        ],
        "response_length_guide": "Full natural conversation — no length guidance needed.",
        "complexity": "Native-equivalent depth. Discuss subtle connotation differences if relevant.",
        "probe": "Fascinating — what are the broader implications of that position?",
    },
}

# ── Topic-specific conversation starters ─────────────────────────────────────

TOPIC_OPENERS = {
    "career": "Tell me about your work — what do you do and what do you enjoy most about it?",
    "education": "What are you studying, or what did you study, and how has it shaped you?",
    "technology": "How has technology changed the way you work or learn in the last few years?",
    "travel": "Tell me about a place you have visited that left a strong impression on you.",
    "family": "How would you describe your family's influence on who you are today?",
    "hobbies": "What do you spend your free time on, and what drew you to that?",
    "environment": "What do you think individuals can realistically do about climate change?",
    "health": "How do you maintain your physical or mental wellbeing, especially under stress?",
    "media": "How has the way you consume news or entertainment changed in recent years?",
    "goals": "What is one significant goal you are working toward right now, and what is your plan?",
    "general": "Tell me — what has been keeping you busy lately?",
}

TOPIC_POOL = list(TOPIC_OPENERS.keys())


# ── Error surfacing strategy ─────────────────────────────────────────────────

def _build_error_section(top_errors: list, cefr: str) -> str:
    if not top_errors:
        return ""

    lines = []
    for e in top_errors[:3]:
        error_type = e.get("error_type", "")
        original = e.get("original_utterance", "")
        count = e.get("recurrence_count", 0)
        lines.append(f"  • {error_type}: \"{original}\" — seen {count}× across past sessions")

    error_block = "\n".join(lines)

    # Map error types to steering strategies
    steering_tips = {
        "TENSE": "Steer toward past narratives ('Tell me about a time when...') to naturally elicit the past-perfect and present-perfect structures.",
        "ARTICLE": "Ask the user to describe people, jobs, and places — article errors surface most in noun phrases.",
        "PREPOSITION": "Ask about relationships, processes, and locations — prepositional errors appear most in these contexts.",
        "COLLOCATION": "Ask about actions and decisions — verb-noun collocation errors surface when describing what people 'do'.",
        "AGREEMENT": "Ask about groups, organizations, and data — number agreement errors cluster here.",
        "FILLER": "Ask questions that require extended answers — filler density increases under planning pressure.",
        "CONDITIONAL": "Use hypothetical questions ('What would you do if...') to naturally elicit conditional structures.",
    }

    active_types = [e.get("error_type", "") for e in top_errors[:3]]
    tips = []
    for t in active_types:
        if t in steering_tips:
            tips.append(f"  ↳ {steering_tips[t]}")

    tip_block = "\n".join(tips) if tips else ""

    return f"""
━━━ PERSONALIZED ERROR TARGETING ━━━
This learner's persistent error patterns (from previous sessions):
{error_block}

STEERING STRATEGY — do NOT correct these directly. Instead:
{tip_block}
  ↳ When the learner produces the error naturally, simply acknowledge their meaning and continue.
    The correction card system will handle the feedback. Your job is to create conditions for the error to surface.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""


# ── Main prompt builder ───────────────────────────────────────────────────────

def build_training_prompt(
    cefr: str,
    top_errors: list,
    topic: str,
    accent: str,
    session_number: Optional[int] = None,
) -> str:
    profile = CEFR_PROFILES.get(cefr.upper(), CEFR_PROFILES["B1"])
    opener = TOPIC_OPENERS.get(topic, TOPIC_OPENERS["general"])
    error_section = _build_error_section(top_errors, cefr)

    # Pick 2 task types for this session
    tasks = profile["task_types"][:2]
    task_block = "\n".join([f"  • {t}" for t in tasks])

    session_context = ""
    if session_number:
        session_context = f"\nThis is session #{session_number} for this learner. Build on previous conversations naturally."

    return f"""You are EchoCoach — a warm, direct English conversation coach speaking with a {profile['description']} ({cefr}) learner.
Target accent to model: {accent}. Your speech should sound natural, not scripted.
{session_context}

━━━ YOUR ROLE ━━━
You lead. You are the conversationalist driving the session.
Open with: "{opener}"
Then guide the conversation through these task types appropriate for {cefr}:
{task_block}

━━━ CONVERSATION RULES ━━━
• Keep each response under 40 words — this is a VOICE session, not a lecture.
• Ask ONE follow-up question per turn. Never stack two questions.
• If the answer is under 2 sentences, probe: "{profile['probe']}"
• {profile['response_length_guide']}
• {profile['complexity']}
• If a nudge is triggered (user silent 3s), say something like: "Take your time — what comes to mind first?"
• Never tell the user their English is "good" or "bad". You are coaching through conversation, not evaluating.
• Never break character. You are a human coach, not an AI.
{error_section}
━━━ WHAT YOU ARE NOT ━━━
• Do not correct errors mid-sentence — the system handles this separately.
• Do not explain grammar rules.
• Do not use robotic transition phrases like "Certainly!" or "Great question!"
"""
