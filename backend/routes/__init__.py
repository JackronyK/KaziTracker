"""
# File: routes/__init__.py
"""
from fastapi import APIRouter
from . import auth, jobs, applications, resumes, interviews, offers, deadlines, profile, parse

def init_routes() -> APIRouter:
    """Initialize and return all routes"""
    router = APIRouter()
    
    router.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    router.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
    router.include_router(applications.router, prefix="/api/applications", tags=["applications"])
    router.include_router(resumes.router, prefix="/api/resumes", tags=["resumes"])
    router.include_router(interviews.router, prefix="/api/interviews", tags=["interviews"])
    router.include_router(offers.router, prefix="/api/offers", tags=["offers"])
    router.include_router(deadlines.router, prefix="/api/deadlines", tags=["deadlines"])
    router.include_router(profile.router, prefix="/api/profile", tags=["profile"])
    router.include_router(parse.router, prefix="/api/parse", tags=["Parser"])
    
    return router