from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPBasicCredentials
from sqlmodel import Session, create_engine, SQLModel, select
from contextlib import asynccontextmanager
import os
import shutil
from datetime import datetime, timedelta
import jwt
from pydantic import BaseModel
import httpx

# ⭐ IMPORTANT: Import all models BEFORE creating tables
from models import User, Resume, Job, Application

# Import parser
from parser import JDParser, extract_resume_text

# =============================================================================
# CONFIG
# =============================================================================
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin_kazi:Admin%40123@localhost:5432/kazitracker")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = "HS256"
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"

# Create upload dir
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

def reset_db_and_tables():
    """⚠️ WARNING: DROPS ALL DATA! Use only in development."""
    print("🔥 Dropping ALL tables...")
    SQLModel.metadata.drop_all(engine)
    print("✅ Creating fresh tables...")
    SQLModel.metadata.create_all(engine)
    print("✨ Database reset complete!")

def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()    
    #reset_db_and_tables()
    print("✅ Database initialized with all tables")
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

def verify_token(credentials: HTTPBasicCredentials = Depends(security)) -> str:
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

# Initialize parser
parser = JDParser(use_llm=USE_LLM)

# =============================================================================
# ROUTES: Auth
# =============================================================================

@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(req: LoginRequest, session: Session = Depends(get_session)):
    """Sign up new user."""
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
    """Login user."""
    user = session.exec(select(User).where(User.email == req.email)).first()
    if not user or user.password_hash != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(req.email)
    return TokenResponse(access_token=token)

@app.get("/api/auth/me")
def get_current_user(email: str = Depends(verify_token)):
    """Get current user info."""
    return {"email": email}

# =============================================================================
# ROUTES: JD Parsing
# =============================================================================

class ParseJDRequest(BaseModel):
    raw_jd: str
    url: str | None = None
    use_llm: bool = False

class ParsedJDResponse(BaseModel):
    title: str
    company: str
    location: str | None = None
    salary_range: str | None = None
    seniority_level: str | None = None
    skills: list[str]
    description: str
    apply_url: str | None = None
    confidence: float

@app.post("/api/parse/jd", response_model=ParsedJDResponse)
def parse_jd(req: ParseJDRequest):
    """Parse job description and extract fields."""
    try:
        result = parser.parse(req.raw_jd, req.url)
        return ParsedJDResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parsing failed: {str(e)}")

# =============================================================================
# ROUTES: Jobs
# =============================================================================

class JobInput(BaseModel):
    title: str
    company: str
    location: str | None = None
    salary_range: str | None = None
    description: str
    apply_url: str | None = None
    parsed_skills: str | None = None
    seniority_level: str | None = None
    source: str | None = None

class JobResponse(JobInput):
    id: int
    created_at: datetime

@app.post("/api/jobs", response_model=JobResponse)
def create_job(job: JobInput, email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """Create a job entry."""
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
        parsed_skills=job.parsed_skills,
        seniority_level=job.seniority_level,
        source=job.source or "manual_paste",
    )
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job

@app.get("/api/jobs")
def list_jobs(email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """List all jobs for the current user."""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    jobs = session.exec(select(Job).where(Job.user_id == user.id).order_by(Job.created_at.desc())).all()
    return jobs

@app.get("/api/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """Get a specific job."""
    user = session.exec(select(User).where(User.email == email)).first()
    job = session.exec(select(Job).where(Job.id == job_id).where(Job.user_id == user.id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@app.patch("/api/jobs/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_update: JobInput, email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """Update a job."""
    user = session.exec(select(User).where(User.email == email)).first()
    job = session.exec(select(Job).where(Job.id == job_id).where(Job.user_id == user.id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_data = job_update.model_dump(exclude_unset=True)
    for key, value in job_data.items():
        setattr(job, key, value)
    
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int, email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """Delete a job."""
    user = session.exec(select(User).where(User.email == email)).first()
    job = session.exec(select(Job).where(Job.id == job_id).where(Job.user_id == user.id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    session.delete(job)
    session.commit()
    return {"detail": "Job deleted"}

# =============================================================================
# ROUTES: Applications (PHASE 4)
# =============================================================================

class ApplicationInput(BaseModel):
    job_id: int
    status: str = "Saved"  # Saved, Applied, Interview, Offer, Rejected
    resume_id: int | None = None
    notes: str | None = None

class ApplicationUpdate(BaseModel):
    status: str | None = None
    applied_date: datetime | None = None
    interview_date: datetime | None = None
    offer_date: datetime | None = None
    rejected_date: datetime | None = None
    resume_id: int | None = None
    notes: str | None = None

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    resume_id: int | None = None
    notes: str | None = None
    applied_date: datetime | None = None
    interview_date: datetime | None = None
    offer_date: datetime | None = None
    rejected_date: datetime | None = None
    created_at: datetime
    updated_at: datetime
    
    # Computed fields for frontend convenience
    company_name: str | None = None
    job_title: str | None = None

@app.post("/api/applications", response_model=ApplicationResponse)
def create_application(
    app_input: ApplicationInput,
    email: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Create a new application."""
    # Verify user
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify job exists and belongs to user
    job = session.exec(select(Job).where(Job.id == app_input.job_id).where(Job.user_id == user.id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create application
    application = Application(
        user_id=user.id,
        job_id=app_input.job_id,
        status=app_input.status,
        resume_id=app_input.resume_id,
        notes=app_input.notes,
    )
    
    session.add(application)
    session.commit()
    session.refresh(application)
    
    # Add job details for frontend
    response = ApplicationResponse(**application.__dict__)
    response.company_name = job.company
    response.job_title = job.title
    
    return response

@app.get("/api/applications")
def list_applications(
    email: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """List all applications for the current user."""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    applications = session.exec(
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
    ).all()
    
    # Enrich with job details
    result = []
    for app in applications:
        job = session.exec(select(Job).where(Job.id == app.job_id)).first()
        response = ApplicationResponse(**app.__dict__)
        if job:
            response.company_name = job.company
            response.job_title = job.title
        result.append(response)
    
    return result

@app.get("/api/applications/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    email: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Get a specific application."""
    user = session.exec(select(User).where(User.email == email)).first()
    application = session.exec(
        select(Application)
        .where(Application.id == app_id)
        .where(Application.user_id == user.id)
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get job details
    job = session.exec(select(Job).where(Job.id == application.job_id)).first()
    response = ApplicationResponse(**application.__dict__)
    if job:
        response.company_name = job.company
        response.job_title = job.title
    
    return response

@app.patch("/api/applications/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int,
    app_update: ApplicationUpdate,
    email: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Update an application (including status)."""
    user = session.exec(select(User).where(User.email == email)).first()
    application = session.exec(
        select(Application)
        .where(Application.id == app_id)
        .where(Application.user_id == user.id)
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update fields
    app_data = app_update.model_dump(exclude_unset=True)
    for key, value in app_data.items():
        setattr(application, key, value)
    
    # Auto-set date when status changes
    if app_update.status:
        if app_update.status == "Applied" and not application.applied_date:
            application.applied_date = datetime.utcnow()
        elif app_update.status == "Interview" and not application.interview_date:
            application.interview_date = datetime.utcnow()
        elif app_update.status == "Offer" and not application.offer_date:
            application.offer_date = datetime.utcnow()
        elif app_update.status == "Rejected" and not application.rejected_date:
            application.rejected_date = datetime.utcnow()
    
    application.updated_at = datetime.utcnow()
    
    session.add(application)
    session.commit()
    session.refresh(application)
    
    # Get job details
    job = session.exec(select(Job).where(Job.id == application.job_id)).first()
    response = ApplicationResponse(**application.__dict__)
    if job:
        response.company_name = job.company
        response.job_title = job.title
    
    return response

@app.delete("/api/applications/{app_id}")
def delete_application(
    app_id: int,
    email: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Delete an application."""
    user = session.exec(select(User).where(User.email == email)).first()
    application = session.exec(
        select(Application)
        .where(Application.id == app_id)
        .where(Application.user_id == user.id)
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    session.delete(application)
    session.commit()
    return {"detail": "Application deleted"}

# =============================================================================
# ROUTES: Resume Upload
# =============================================================================

class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    tags: str | None = None
    extracted_text: str | None = None
    created_at: datetime

@app.post("/api/resumes/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    tags: str | None = None,
    email: str = Depends(verify_token),
    session: Session = Depends(get_session),
):
    """Upload and parse a resume."""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")
    
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX supported")
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{user.id}_{file.filename}")
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    # Extract text
    try:
        extracted_text = extract_resume_text(file_path, file_ext)
    except Exception as e:
        extracted_text = None
        print(f"Text extraction failed: {e}")
    
    # Save to DB
    resume = Resume(
        user_id=user.id,
        filename=file.filename,
        file_path=file_path,
        file_type=file_ext,
        extracted_text=extracted_text[:1000] if extracted_text else None,
        tags=tags,
    )
    session.add(resume)
    session.commit()
    session.refresh(resume)
    
    return resume

@app.get("/api/resumes")
def list_resumes(email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """List all resumes for the current user."""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    resumes = session.exec(select(Resume).where(Resume.user_id == user.id)).all()
    return resumes

@app.patch("/api/resumes/{resume_id}")
def update_resume_tags(
    resume_id: int,
    tags: str | None = None,
    email: str = Depends(verify_token),
    session: Session = Depends(get_session)
):
    """Update resume tags."""
    user = session.exec(select(User).where(User.email == email)).first()
    resume = session.exec(
        select(Resume)
        .where(Resume.id == resume_id)
        .where(Resume.user_id == user.id)
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if tags is not None:
        resume.tags = tags
    
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume

@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: int, email: str = Depends(verify_token), session: Session = Depends(get_session)):
    """Delete a resume."""
    user = session.exec(select(User).where(User.email == email)).first()
    resume = session.exec(select(Resume).where(Resume.id == resume_id).where(Resume.user_id == user.id)).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete file
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    session.delete(resume)
    session.commit()
    return {"detail": "Resume deleted"}

# =============================================================================
# ROUTES: Health & Debug
# =============================================================================

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
def root():
    return {
        "message": "JobAppTracker API",
        "docs": "/docs",
        "health": "/health",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)