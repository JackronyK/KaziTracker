# ============================================================================
# 4. schemas/__init__.py - Export all schemas
# ============================================================================

"""
# File: schemas/__init__.py
"""
from .auth import LoginRequest, TokenResponse
from .job import JobInput, JobResponse
from .application import ApplicationInput, ApplicationUpdate, ApplicationResponse
from .resume import ResumeResponse
from .interview import InterviewCreate, InterviewUpdate
from .offer import OfferCreate, OfferUpdate, OfferResponse, OfferWithApplication
from .deadline import DeadlineCreate, DeadlineUpdate
from .profile import ProfileUpdate, ProfileResponse

__all__ = [
    "LoginRequest",
    "TokenResponse",
    "JobInput",
    "JobResponse",
    "ApplicationInput",
    "ApplicationUpdate",
    "ApplicationResponse",
    "ResumeResponse",
    "InterviewCreate",
    "InterviewUpdate",
    "OfferCreate",
    "OfferUpdate",
    "OfferResponse",
    "OfferWithApplication",    
    "DeadlineCreate",
    "DeadlineUpdate",
    "ProfileUpdate",
    "ProfileResponse",
]
