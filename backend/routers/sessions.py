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
    sessions_res = (
        supabase.table("sessions")
        .select("fluency_score, lexical_score, grammar_score, pronunciation_score, cefr_score, started_at")
        .eq("user_id", user["id"])
        .order("started_at", desc=True)
        .limit(10)
        .execute()
    )
    user_res = (
        supabase.table("users")
        .select("cefr_level, ielts_score, target_exam")
        .eq("id", user["id"])
        .single()
        .execute()
    )
    return {
        "user": user_res.data,
        "recent_sessions": sessions_res.data,
    }
