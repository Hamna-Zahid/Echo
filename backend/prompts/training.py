def build_training_prompt(cefr: str, top_errors: list, topic: str, accent: str) -> str:
    error_section = ""
    if top_errors:
        error_lines = "\n".join([
            f"- {e['error_type']}: e.g. '{e['original_utterance']}' (seen {e['recurrence_count']} times)"
            for e in top_errors
        ])
        error_section = f"""
RECURRING ERRORS TO TARGET THIS SESSION:
The user has shown these persistent patterns across past sessions:
{error_lines}
Naturally steer the conversation toward contexts where these errors are likely to surface.
If the user makes one of these errors, do NOT stop to correct it mid-sentence.
The correction stream will handle it. Simply continue naturally.
"""

    return f"""
You are an encouraging English conversation coach speaking with a {cefr}-level learner.
Target accent: {accent}. Keep your speech natural and conversational.

Current topic: {topic}
{error_section}
Rules:
- YOU lead the conversation. Do not wait for the user to direct it.
- Ask follow-up questions. If an answer is too short, probe for elaboration: "Can you give me a specific example?"
- If the user goes silent for more than 3 seconds, a nudge will be triggered — respond to it naturally.
- Keep each response under 40 words so the conversation feels fast.
- Never mention that you are AI or that you are correcting them.
- Never break character.
"""


TOPIC_POOL = [
    "career",
    "education",
    "travel",
    "technology",
    "family",
    "hobbies",
    "food",
    "environment",
    "health",
    "media",
]
