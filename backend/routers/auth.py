from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.supabase import get_supabase

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
