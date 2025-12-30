# ============================================================================
# PROJECT STRUCTURE (Create this folder layout)
# ============================================================================

"""
backend/
├── main.py                          # ← Simplified main file
├── models.py                        # ← Existing models (no changes)
├── parser.py                        # ← Existing parser (no changes)
├── backend.env                      # ← Existing config
│
├── core/                            # ← NEW: Core utilities
│   ├── __init__.py
│   ├── config.py                    # Configuration & environment
│   ├── security.py                  # JWT & auth utilities
│   └── database.py                  # Database session management
│
├── schemas/                         # ← NEW: Pydantic schemas
│   ├── __init__.py
│   ├── auth.py                      # Auth request/response schemas
│   ├── job.py
│   ├── application.py
│   ├── resume.py
│   ├── interview.py
│   ├── offer.py
│   ├── deadline.py
│   └── profile.py
│
├── routes/                          # ← NEW: API routes (modular)
│   ├── __init__.py
│   ├── auth.py
│   ├── jobs.py
│   ├── applications.py
│   ├── resumes.py
│   ├── interviews.py
│   ├── offers.py
│   ├── deadlines.py
│   └── profile.py
│
└── uploads/                         # ← Resume storage
"""

# ============================================================================
# 1. core/config.py - Configuration Management
# ============================================================================

"""
# File: core/config.py
"""
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

ENV = os.getenv("ENV", "dev").lower()
if ENV != "prod":
    load_dotenv("backend.env")

# Database
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_USER = os.getenv("POSTGRES_USER")
    DB_PASS = os.getenv("POSTGRES_PASSWORD")
    DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
    DB_PORT = os.getenv("POSTGRES_PORT", "5432")
    DB_NAME = os.getenv("POSTGRES_DB")
    if not all([DB_USER, DB_PASS, DB_NAME]):
        raise RuntimeError("DATABASE_URL not set and POSTGRES_{USER,PASSWORD,DB} incomplete")
    DB_PASS_ENC = quote_plus(DB_PASS)
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS_ENC}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

# File uploads
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# LLM
USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"

# CORS
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",") if os.getenv("CORS_ALLOW_ORIGINS") else ["*"]

# App
APP_NAME = "JobAppTracker API"
APP_VERSION = "0.1.0"


# ============================================================================
# 2. core/database.py - Database Setup
# ============================================================================

"""
# File: core/database.py
"""
from sqlmodel import Session, create_engine, SQLModel
from core.config import DATABASE_URL, ENV

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

def init_db():
    """Initialize database (create tables if needed - dev only)"""
    if ENV != "prod":
        SQLModel.metadata.create_all(engine)
        print("✓ Database tables ensured (dev mode)")

def get_session():
    """Get SQLModel session"""
    with Session(engine) as session:
        yield session

# Backwards compatibility
def get_db():
    """Alias for get_session"""
    with Session(engine) as session:
        yield session


# ============================================================================
# 3. core/security.py - Authentication Utilities
# ============================================================================

"""
# File: core/security.py
"""
from datetime import datetime, timedelta
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from core.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS
from core.database import get_session
from models import User

security = HTTPBearer()

def create_access_token(email: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT and return email"""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing credentials"
        )
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def get_current_user(
    email: str = Depends(verify_token),
    session: Session = Depends(get_session)
) -> User:
    """Get current user from token"""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


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
from .offer import OfferCreate, OfferUpdate
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
    "DeadlineCreate",
    "DeadlineUpdate",
    "ProfileUpdate",
    "ProfileResponse",
]


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


# ============================================================================
# 6. routes/__init__.py - Register all routes
# ============================================================================

"""
# File: routes/__init__.py
"""
from fastapi import APIRouter
from . import auth, jobs, applications, resumes, interviews, offers, deadlines, profile

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
    
    return router


# ============================================================================
# 7. routes/auth.py - Authentication routes
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


# ============================================================================
# 8. routes/jobs.py - Job routes (EXAMPLE)
# ============================================================================

"""
# File: routes/jobs.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from core.database import get_session
from core.security import get_current_user
from models import User, Job
from schemas import JobInput, JobResponse
from datetime import datetime

router = APIRouter()

@router.post("", response_model=JobResponse, status_code=201)
def create_job(
    job: JobInput,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create new job"""
    db_job = Job(
        user_id=user.id,
        title=job.title,
        company=job.company,
        location=job.location,
        salary_range=job.salary_range,
        description=job.description,
        apply_url=job.apply_url,
        parsed_skills=job.parsed_skills,
        seniority_level=job.seniority_level,
        source=job.source or "manual_paste",
    )
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job

@router.get("", response_model=list[JobResponse])
def list_jobs(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List user's jobs"""
    jobs = session.exec(
        select(Job)
        .where(Job.user_id == user.id)
        .order_by(Job.created_at.desc())
    ).all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get job by ID"""
    job = session.exec(
        select(Job).where(Job.id == job_id, Job.user_id == user.id)
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobInput,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update job"""
    job = session.exec(
        select(Job).where(Job.id == job_id, Job.user_id == user.id)
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    for key, value in job_update.model_dump(exclude_unset=True).items():
        setattr(job, key, value)
    
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@router.delete("/{job_id}", status_code=204)
def delete_job(
    job_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete job"""
    job = session.exec(
        select(Job).where(Job.id == job_id, Job.user_id == user.id)
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    session.delete(job)
    session.commit()


# ============================================================================
# 9. routes/profile.py - User profile routes
# ============================================================================

"""
# File: routes/profile.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from core.database import get_session
from core.security import get_current_user
from models import User
from schemas import ProfileUpdate, ProfileResponse
from datetime import datetime

router = APIRouter()

@router.get("", response_model=ProfileResponse)
def get_profile(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get user profile"""
    return user

@router.put("", response_model=ProfileResponse)
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

@router.patch("", response_model=ProfileResponse)
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


# ============================================================================
# 10. CLEAN MAIN.PY - Simplified & Production Ready
# ============================================================================

"""
# File: main.py (SIMPLIFIED)
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import APP_NAME, APP_VERSION, CORS_ALLOW_ORIGINS, ENV
from core.database import init_db, engine
from routes import init_routes
from parser import JDParser
from models import User, Job, Application, Resume, Interview, Offer, Deadline
from datetime import datetime

# Initialize parser
parser = JDParser(use_llm=os.getenv("USE_LLM", "false").lower() == "true")

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """App startup and shutdown"""
    init_db()
    print("✓ App started")
    yield
    print("✓ App shutting down")

# Create app
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(init_routes())

# Health check
@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
def root():
    return {
        "message": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }

# Run
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=ENV != "prod"
    )