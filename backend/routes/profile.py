# ============================================================================
# 8. routes.py - User profile routes
# ============================================================================

"""
# File: routes.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from core.database import get_session
from core.security import get_current_user
from models import User
from schemas import ProfileUpdate, ProfileResponse
from datetime import datetime

router = APIRouter()

@router.get("/get", response_model=ProfileResponse)
def get_profile(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get user profile"""
    return user

@router.put("/update", response_model=ProfileResponse)
def update_profile(
    profile_data: ProfileUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update user profile"""
    if not profile_data.full_name or not profile_data.full_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required"
        )
    
    if len(profile_data.full_name.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name must be at least 2 characters"
        )
    
    user.full_name = profile_data.full_name.strip()
    user.phone_number = profile_data.phone_number
    user.location = profile_data.location
    user.headline = profile_data.headline
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user

@router.patch("/update", response_model=ProfileResponse)
def partial_update_profile(
    profile_data: dict,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Partially update profile"""
    if "full_name" in profile_data:
        if not profile_data["full_name"].strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name cannot be empty"
            )
        user.full_name = profile_data["full_name"].strip()
    
    if "phone_number" in profile_data:
        user.phone_number = profile_data["phone_number"]
    
    if "location" in profile_data:
        user.location = profile_data["location"]
    
    if "headline" in profile_data:
        user.headline = profile_data["headline"]
    
    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user