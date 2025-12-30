# ============================================================================
# 7. schemas/profile.py
# ============================================================================
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class ProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: str
    phone_number: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None

class ProfileResponse(BaseModel):
    """Response schema for user profile"""
    id: int
    email: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True