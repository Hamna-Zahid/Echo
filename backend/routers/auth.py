from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from pydantic import BaseModel

from db.supabase import get_supabase, verify_token

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    password: str
    target_exam: str = "IELTS"
    preferred_accent: str = "american"


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(req: RegisterRequest):
    supabase = get_supabase()
    try:
        res = supabase.auth.sign_up({"email": req.email, "password": req.password})
        if res.user is None:
            raise HTTPException(status_code=400, detail="Registration failed")

        user_id = res.user.id
        supabase.table("users").insert({
            "id": user_id,
            "target_exam": req.target_exam,
            "preferred_accent": req.preferred_accent,
        }).execute()

        return {"user_id": user_id, "access_token": res.session.access_token if res.session else None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(req: LoginRequest):
    supabase = get_supabase()
    try:
        res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        if res.session is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {
            "access_token": res.session.access_token,
            "user_id": res.user.id,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
async def logout():
    supabase = get_supabase()
    supabase.auth.sign_out()
    return {"status": "logged out"}


class ProfileUpdateRequest(BaseModel):
    cefr_level: Optional[str] = None
    target_exam: Optional[str] = None
    preferred_accent: Optional[str] = None
    goal: Optional[str] = None


@router.patch("/profile")
async def update_profile(
    req: ProfileUpdateRequest,
    authorization: Optional[str] = Header(None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = get_supabase()
    updates = {k: v for k, v in req.dict().items() if v is not None}
    if not updates:
        return {"status": "no changes"}

    supabase.table("users").update(updates).eq("id", user["id"]).execute()
    return {"status": "updated"}


@router.delete("/account")
async def delete_account(authorization: Optional[str] = Header(None)):
    """
    Permanently delete the authenticated user's account and all their data.
    Cascade deletes handle sessions/errors via FK constraints.
    After this call the client should sign out and redirect to login.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = get_supabase()
    user_id = user["id"]

    try:
        # Delete user profile row (FK cascades remove sessions, errors, learning_plans)
        supabase.table("users").delete().eq("id", user_id).execute()
    except Exception:
        pass  # Row may not exist (new user who never completed onboarding)

    try:
        # Delete from Supabase Auth — requires service role key
        supabase.auth.admin.delete_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auth deletion failed: {str(e)}")

    return {"status": "deleted"}
