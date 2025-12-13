## backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlmodel import Session, create_engine, SQLModel, select
from contextlib import asynccontextmanager
import os
from datetime import datetime, timedelta
import jwt
from pydantic import BaseModel
import httpx

# =============================================================================
# CONFIG
# =============================================================================
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/jobapp")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = "HS256"

# =============================================================================
# DB SETUP
# =============================================================================
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # Verify connections before use
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    print("✅ Database initialized")
    yield
    # Shutdown
    print("👋 App shutting down")

# =============================================================================
# AUTH SCHEMAS & UTILS
# =============================================================================
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

security = HTTPBearer()

def create_access_token(email: str, expires_in_hours: int = 24):
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(hours=expires_in_hours),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# =============================================================================
# APP INIT
# =============================================================================
app = FastAPI(title="JobAppTracker API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# ROUTES: Auth
# =============================================================================

@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(req: LoginRequest, session: Session = Depends(get_session)):
    """Simple signup endpoint (real app would hash passwords)."""
    from models import User
    
    existing = session.exec(select(User).where(User.email == req.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = User(email=req.email, password_hash=req.password)  # ⚠️ Hash in production!
    session.add(user)
    session.commit()
    session.refresh(user)
    
    token = create_access_token(req.email)
    return TokenResponse(access_token=token)

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, session: Session = Depends(get_session)):
    """Simple login endpoint."""
    from models import User
    
    user = session.exec(select(User).where(User.email == req.email)).first()
    if not user or user.password_hash != req.password:  # ⚠️ Use proper verification!
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(req.email)
    return TokenResponse(access_token=token)

@app.get("/api/auth/me")
def get_current_user(email: str = Depends(verify_token)):
    """Get current user info."""
    return {"email": email}

# =============================================================================
# ROUTES: Jobs (JD Ingestion)
# =============================================================================

class JobInput(BaseModel):
    title: str
    company: str
    location: str | None = None
    salary_range: str | None = None
    description: str
    apply_url: str | None = None

class JobResponse(JobInput):
    id: int
    created_at: datetime

@app.post("/api/jobs", response_model=JobResponse)
def create_job(job: JobInput, email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """Create a job entry (data already parsed by parser)."""
    from models import Job, User
    
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_job = Job(
        user_id=user.id,
        title=job.title,
        company=job.company,
        location=job.location,
        salary_range=job.salary_range,
        description=job.description,
        apply_url=job.apply_url,
    )
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job

@app.get("/api/jobs")
def list_jobs(email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """List all jobs for the current user."""
    from models import Job, User
    
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    jobs = session.exec(select(Job).where(Job.user_id == user.id)).all()
    return jobs

# =============================================================================
# ROUTES: Health & Debug
# =============================================================================

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)