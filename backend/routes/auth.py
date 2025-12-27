# ============================================================================
# 1. routes/auth.py - Authentication routes
# ============================================================================

"""
# File: routes/auth.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from core.database import get_session
from core.security import create_access_token, get_current_user
from models import User
from schemas import LoginRequest, TokenResponse

router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
def signup(req: LoginRequest, session: Session = Depends(get_session)):
    """Sign up new user"""
    existing = session.exec(select(User).where(User.email == req.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    user = User(email=req.email, password_hash=req.password)
    session.add(user)
    session.commit()
    session.refresh(user)
    
    token = create_access_token(req.email)
    return TokenResponse(access_token=token)

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, session: Session = Depends(get_session)):
    """Login user"""
    user = session.exec(select(User).where(User.email == req.email)).first()
    if not user or user.password_hash != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    token = create_access_token(req.email)
    return TokenResponse(access_token=token)

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    """Get current user"""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
    }