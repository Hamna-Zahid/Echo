import os
from typing import Optional

from supabase import create_client, Client

_supabase: Client | None = None


async def init_supabase() -> None:
    global _supabase
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        print("WARNING: Supabase credentials not configured. DB operations will fail.")
        return
    _supabase = create_client(url, key)


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        _supabase = create_client(url, key)
    return _supabase


def verify_token(token: str) -> Optional[dict]:
    """
    Verify a Supabase JWT and return the user payload.
    Uses the service-role client to validate via get_user().
    """
    try:
        supabase = get_supabase()
        res = supabase.auth.get_user(token)
        if res and res.user:
            return {"id": res.user.id, "email": res.user.email}
        return None
    except Exception:
        return None
