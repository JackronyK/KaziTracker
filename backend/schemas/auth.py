# ============================================================================
# 5. schemas/auth.py
# ============================================================================

"""
# File: schemas/auth.py
"""
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"