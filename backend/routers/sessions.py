from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

from db.supabase import get_supabase, verify_token

router = APIRouter()


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ", 1)[1]
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


@router.get("/")
async def list_sessions(user=Depends(get_current_user)):
    supabase = get_supabase()
    res = (
        supabase.table("sessions")
        .select("*")
        .eq("user_id", user["id"])
        .order("started_at", desc=True)
        .limit(20)
        .execute()
    )
    return {"sessions": res.data}


# NOTE: Static sub-paths (/errors/..., /progress/...) MUST come before
# the wildcard /{session_id} route so FastAPI's router matches them first.

@router.get("/errors/recurring")
async def get_recurring_errors(user=Depends(get_current_user)):
    supabase = get_supabase()
    res = (
        supabase.table("errors")
        .select("*")
        .eq("user_id", user["id"])
        .eq("resolved", False)
        .order("recurrence_count", desc=True)
        .limit(10)
        .execute()
    )
    return {"errors": res.data}


@router.get("/progress/summary")
async def get_progress(user=Depends(get_current_user)):
    supabase = get_supabase()

    # Parallel queries for all data needed by the home + progress screens
    sessions_res = (
        supabase.table("sessions")
        .select("id, fluency_score, lexical_score, grammar_score, pronunciation_score, cefr_score, started_at, mode, duration_seconds")
        .eq("user_id", user["id"])
        .order("started_at", desc=True)
        .limit(10)
        .execute()
    )
    user_res = (
        supabase.table("users")
        .select("cefr_level, ielts_score, target_exam, preferred_accent, streak_days")
        .eq("id", user["id"])
        .single()
        .execute()
    )
    total_sessions_res = (
        supabase.table("sessions")
        .select("id", count="exact")
        .eq("user_id", user["id"])
        .execute()
    )
    errors_fixed_res = (
        supabase.table("errors")
        .select("id", count="exact")
        .eq("user_id", user["id"])
        .eq("resolved", True)
        .execute()
    )

    user_data = user_res.data or {}
    # Merge computed stats into user object so the mobile app can read them in one place
    user_data["total_sessions"] = total_sessions_res.count or 0
    user_data["total_errors_fixed"] = errors_fixed_res.count or 0

    return {
        "user": user_data,
        "recent_sessions": sessions_res.data,
    }


@router.patch("/errors/{error_id}/resolve")
async def resolve_error(error_id: str, user=Depends(get_current_user)):
    """Mark a recurring error as resolved so it's hidden from the errors list."""
    supabase = get_supabase()
    res = (
        supabase.table("errors")
        .update({"resolved": True})
        .eq("id", error_id)
        .eq("user_id", user["id"])  # Security: only the owner can resolve
        .execute()
    )
    return {"status": "resolved"}


@router.get("/{session_id}")
async def get_session(session_id: str, user=Depends(get_current_user)):
    supabase = get_supabase()
    res = (
        supabase.table("sessions")
        .select("*, errors(*)")
        .eq("id", session_id)
        .eq("user_id", user["id"])
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return res.data
