# main.py (production-ready, Alembic-managed; do NOT auto-run migrations here)
from __future__ import annotations
import os
from urllib.parse import quote_plus
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import shutil

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, create_engine, SQLModel, select
from pydantic import BaseModel
from typing import Optional, List
import jwt

# Load .env in non-prod for convenience (production should inject env vars)
ENV = os.getenv("ENV", "dev").lower()
if ENV != "prod":
    load_dotenv("backend.env")  # silent if file missing

# -----------------------
# Import models & parser
# -----------------------
# Ensure this import works; adjust path if models are in a package (e.g. from app.models import ...)
from models import User, Resume, Job, Application, Interview, Offer, Deadline
from parser import JDParser, extract_resume_text

# -----------------------
# Configuration
# -----------------------
# Either set DATABASE_URL directly OR set POSTGRES_* components
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

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# -----------------------
# Engine & sessions
# -----------------------
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)


def get_session():
    """Primary SQLModel session dependency (recommended)."""
    with Session(engine) as session:
        yield session


# Backwards-compatible alias used by some handlers (keeps signatures like db: Session = Depends(get_db))
def get_db():
    with Session(engine) as session:
        yield session


# -----------------------
# Lifespan
# -----------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # DO NOT modify schema in production. If in dev, you can create missing tables.
    if ENV != "prod":
        # dev convenience: create missing tables only (won't alter existing columns)
        SQLModel.metadata.create_all(engine)
        print("Dev: ensured tables exist (create_all)")
    yield
    # shutdown logic if needed
    print("App shutting down")


# -----------------------
# Auth utilities
# -----------------------
security = HTTPBearer()


def create_access_token(email: str, expires_in_hours: int = 24) -> str:
    payload = {"sub": email, "exp": datetime.utcnow() + timedelta(hours=expires_in_hours)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT and return the subject (user email)."""
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(email: str = Depends(verify_token), session: Session = Depends(get_session)) -> User:
    """Resolve User model from token's subject."""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# -----------------------
# App init
# -----------------------
app = FastAPI(title="JobAppTracker API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(",") if os.getenv("CORS_ALLOW_ORIGINS") else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

parser = JDParser(use_llm=USE_LLM)

# -----------------------
# Schemas (keep your existing ones)
# -----------------------
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# -----------------------
# Auth routes
# -----------------------
@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(req: LoginRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == req.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # NOTE: Hash passwords in production (bcrypt). This is placeholder.
    user = User(email=req.email, password_hash=req.password)
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(req.email)
    return TokenResponse(access_token=token)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == req.email)).first()
    if not user or user.password_hash != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(req.email)
    return TokenResponse(access_token=token)


@app.get("/api/auth/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email}


# -----------------------
# JD parse route (unchanged)
# -----------------------
class ParseJDRequest(BaseModel):
    raw_jd: str
    url: Optional[str] = None
    use_llm: bool = False


class ParsedJDResponse(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    seniority_level: Optional[str] = None
    skills: list[str]
    description: str
    apply_url: Optional[str] = None
    confidence: float


@app.post("/api/parse/jd", response_model=ParsedJDResponse)
def parse_jd(req: ParseJDRequest):
    try:
        result = parser.parse(req.raw_jd, req.url)
        return ParsedJDResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parsing failed: {str(e)}")


# -----------------------
# Jobs (kept your logic but consistent session/user)
# -----------------------
class JobInput(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    description: str
    apply_url: Optional[str] = None
    parsed_skills: Optional[str] = None
    seniority_level: Optional[str] = None
    source: Optional[str] = None


class JobResponse(JobInput):
    id: int
    created_at: datetime


@app.post("/api/jobs", response_model=JobResponse)
def create_job(job: JobInput, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
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
def list_jobs(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    jobs = session.exec(select(Job).where(Job.user_id == user.id).order_by(Job.created_at.desc())).all()
    return jobs


@app.get("/api/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.exec(select(Job).where(Job.id == job_id, Job.user_id == user.id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.patch("/api/jobs/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_update: JobInput, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.exec(select(Job).where(Job.id == job_id, Job.user_id == user.id)).first()
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
def delete_job(job_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.exec(select(Job).where(Job.id == job_id, Job.user_id == user.id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    session.delete(job)
    session.commit()
    return {"detail": "Job deleted"}


# -----------------------
# Applications (kept logic, consistent)
# -----------------------
class ApplicationInput(BaseModel):
    job_id: int
    status: str = "Saved"
    resume_id: Optional[int] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offer_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    resume_id: Optional[int] = None
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    offer_details: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    resume_id: Optional[int] = None
    notes: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offer_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    offer_details: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    company_name: Optional[str] = None
    job_title: Optional[str] = None


@app.post("/api/applications", response_model=ApplicationResponse)
def create_application(app_input: ApplicationInput, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.exec(select(Job).where(Job.id == app_input.job_id, Job.user_id == user.id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    application = Application(user_id=user.id, job_id=app_input.job_id, status=app_input.status, resume_id=app_input.resume_id, notes=app_input.notes)
    session.add(application)
    session.commit()
    session.refresh(application)
    response = ApplicationResponse(**application.__dict__)
    response.company_name = job.company
    response.job_title = job.title
    return response


@app.get("/api/applications")
def list_applications(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    apps = session.exec(select(Application).where(Application.user_id == user.id).order_by(Application.created_at.desc())).all()
    result = []
    for a in apps:
        job = session.exec(select(Job).where(Job.id == a.job_id)).first()
        response = ApplicationResponse(**a.__dict__)
        response.company_name = job.company if job else None
        response.job_title = job.title if job else None
        result.append(response)
    return result


@app.get("/api/applications/{app_id}", response_model=ApplicationResponse)
def get_application(app_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    a = session.exec(select(Application).where(Application.id == app_id, Application.user_id == user.id)).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    job = session.exec(select(Job).where(Job.id == a.job_id)).first()
    response = ApplicationResponse(**a.__dict__)
    response.company_name = job.company if job else None
    response.job_title = job.title if job else None
    return response


@app.patch("/api/applications/{app_id}", response_model=ApplicationResponse)
def update_application(app_id: int, app_update: ApplicationUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    a = session.exec(select(Application).where(Application.id == app_id, Application.user_id == user.id)).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    data = app_update.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(a, k, v)
    # auto set timestamps on status changes
    if app_update.status:
        if app_update.status == "Applied" and not a.applied_date:
            a.applied_date = datetime.utcnow()
        elif app_update.status == "Interview" and not a.interview_date:
            a.interview_date = datetime.utcnow()
        elif app_update.status == "Offer" and not a.offer_date:
            a.offer_date = datetime.utcnow()
        elif app_update.status == "Rejected" and not a.rejected_date:
            a.rejected_date = datetime.utcnow()
    a.updated_at = datetime.utcnow()
    session.add(a)
    session.commit()
    session.refresh(a)
    job = session.exec(select(Job).where(Job.id == a.job_id)).first()
    response = ApplicationResponse(**a.__dict__)
    response.company_name = job.company if job else None
    response.job_title = job.title if job else None
    return response


@app.delete("/api/applications/{app_id}")
def delete_application(app_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    a = session.exec(select(Application).where(Application.id == app_id, Application.user_id == user.id)).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    session.delete(a)
    session.commit()
    return {"detail": "Application deleted"}


# -----------------------
# Resume upload and handling (kept as-is)
# -----------------------
class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    tags: Optional[str] = None
    extracted_text: Optional[str] = None
    uploaded_at: datetime


@app.post("/api/resumes/upload", response_model=ResumeResponse)
async def upload_resume(file: UploadFile = File(...), tags: Optional[str] = None, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX supported")
    file_path = os.path.join(UPLOAD_DIR, f"{user.id}_{file.filename}")
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    try:
        extracted_text = extract_resume_text(file_path, file_ext)
    except Exception as e:
        extracted_text = None
        print("Resume extraction failed:", e)
    resume = Resume(user_id=user.id, filename=file.filename, file_path=file_path, file_type=file_ext, extracted_text=(extracted_text[:1000] if extracted_text else None), tags=tags)
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume


@app.get("/api/resumes")
def list_resumes(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Resume).where(Resume.user_id == user.id)).all()


@app.patch("/api/resumes/{resume_id}")
def update_resume_tags(resume_id: int, tags: Optional[str] = None, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    r = session.exec(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    if tags is not None:
        r.tags = tags
    session.add(r)
    session.commit()
    session.refresh(r)
    return r


@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    r = session.exec(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    if os.path.exists(r.file_path):
        os.remove(r.file_path)
    session.delete(r)
    session.commit()
    return {"detail": "Resume deleted"}


# -----------------------
# Interviews / Offers / Deadlines - migrated to SQLModel patterns
# -----------------------

# Pydantic / input DTOs (use for request bodies)
class InterviewCreate(BaseModel):
    application_id: int
    date: datetime
    time: str
    type: Optional[str] = "phone"
    interviewer: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    prep_checklist: Optional[str] = None
    reminders: Optional[bool] = True


class InterviewUpdate(BaseModel):
    date: Optional[datetime] = None
    time: Optional[str] = None
    type: Optional[str] = None
    interviewer: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    prep_checklist: Optional[str] = None
    reminders: Optional[bool] = None


class OfferCreate(BaseModel):
    application_id: int
    company_name: str
    position: str
    salary: float
    benefits: Optional[str] = None
    start_date: datetime
    deadline: datetime
    status: Optional[str] = "pending"


class OfferUpdate(BaseModel):
    salary: Optional[float] = None
    status: Optional[str] = None
    negotiation_history: Optional[str] = None


class DeadlineCreate(BaseModel):
    application_id: int
    title: str
    due_date: datetime
    type: Optional[str] = "response"
    priority: Optional[str] = "medium"
    notes: Optional[str] = None


class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[datetime] = None
    type: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None


# -----------------------
# Interviews endpoints (API prefix, safe bodies)
# -----------------------
@app.get("/api/interviews", response_model=List[Interview])
def list_interviews(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Interview).where(Interview.user_id == user.id)).all()

@app.post("/api/interviews", response_model=Interview, status_code=201)
def create_interview(interview_in: InterviewCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # verify application belongs to user
    app_obj = session.exec(select(Application).where(Application.id == interview_in.application_id, Application.user_id == user.id)).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db_interview = Interview(
        user_id=user.id,
        application_id=interview_in.application_id,
        date=interview_in.date,
        time=interview_in.time,
        type=interview_in.type,
        interviewer=interview_in.interviewer,
        location=interview_in.location,
        notes=interview_in.notes,
        prep_checklist=interview_in.prep_checklist,
        reminders=interview_in.reminders,
    )
    session.add(db_interview)
    session.commit()
    session.refresh(db_interview)
    return db_interview


@app.get("/api/interviews/{interview_id}", response_model=Interview)
def get_interview(interview_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    interview = session.exec(select(Interview).where(Interview.id == interview_id, Interview.user_id == user.id)).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview



@app.put("/api/interviews/{interview_id}", response_model=Interview)
def update_interview(interview_id: int, interview_in: InterviewUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_interview = session.exec(select(Interview).where(Interview.id == interview_id, Interview.user_id == user.id)).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = interview_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_interview, k, v)
    db_interview.updated_at = datetime.utcnow()
    session.add(db_interview)
    session.commit()
    session.refresh(db_interview)
    return db_interview


@app.delete("/api/interviews/{interview_id}", status_code=204)
def delete_interview(interview_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    interview = session.exec(select(Interview).where(Interview.id == interview_id, Interview.user_id == user.id)).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    session.delete(interview)
    session.commit()
    return


# -----------------------
# Offers endpoints (API prefix)
# -----------------------

# -----------------------
# Offers endpoints (API prefix)
# -----------------------
@app.get("/api/offers", response_model=List[Offer])
def list_offers(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Offer).where(Offer.user_id == user.id).order_by(Offer.created_at.desc())).all()


@app.post("/api/offers", response_model=Offer, status_code=201)
def create_offer(offer_in: OfferCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    app_obj = session.exec(select(Application).where(Application.id == offer_in.application_id, Application.user_id == user.id)).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db_offer = Offer(
        user_id=user.id,
        application_id=offer_in.application_id,
        company_name=offer_in.company_name,
        position=offer_in.position,
        salary=offer_in.salary,
        benefits=offer_in.benefits,
        start_date=offer_in.start_date,
        deadline=offer_in.deadline,
        status=offer_in.status or "pending",
    )
    session.add(db_offer)
    session.commit()
    session.refresh(db_offer)
    return db_offer


@app.put("/api/offers/{offer_id}", response_model=Offer)
def update_offer(offer_id: int, offer_in: OfferUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_offer = session.exec(select(Offer).where(Offer.id == offer_id, Offer.user_id == user.id)).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    data = offer_in.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(db_offer, k, v)
    db_offer.updated_at = datetime.utcnow()
    session.add(db_offer)
    session.commit()
    session.refresh(db_offer)
    return db_offer


@app.delete("/api/offers/{offer_id}", status_code=204)
def delete_offer(offer_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_offer = session.exec(select(Offer).where(Offer.id == offer_id, Offer.user_id == user.id)).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    session.delete(db_offer)
    session.commit()
    return


# -----------------------
# Deadlines endpoints (API prefix)
# -----------------------
@app.get("/api/deadlines", response_model=List[Deadline])
def list_deadlines(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Deadline).where(Deadline.user_id == user.id).order_by(Deadline.due_date)).all()


@app.post("/api/deadlines", response_model=Deadline, status_code=201)
def create_deadline(deadline_in: DeadlineCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    app_obj = session.exec(select(Application).where(Application.id == deadline_in.application_id, Application.user_id == user.id)).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db_deadline = Deadline(
        user_id=user.id,
        application_id=deadline_in.application_id,
        title=deadline_in.title,
        due_date=deadline_in.due_date,
        type=deadline_in.type,
        priority=deadline_in.priority,
        notes=deadline_in.notes,
    )
    session.add(db_deadline)
    session.commit()
    session.refresh(db_deadline)
    return db_deadline


@app.put("/api/deadlines/{deadline_id}", response_model=Deadline)
def update_deadline(deadline_id: int, deadline_in: DeadlineUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_deadline = session.exec(select(Deadline).where(Deadline.id == deadline_id, Deadline.user_id == user.id)).first()
    if not db_deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    data = deadline_in.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(db_deadline, k, v)
    db_deadline.updated_at = datetime.utcnow()
    session.add(db_deadline)
    session.commit()
    session.refresh(db_deadline)
    return db_deadline


@app.delete("/api/deadlines/{deadline_id}", status_code=204)
def delete_deadline(deadline_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_deadline = session.exec(select(Deadline).where(Deadline.id == deadline_id, Deadline.user_id == user.id)).first()
    if not db_deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    session.delete(db_deadline)
    session.commit()
    return


# -----------------------
# Health & root
# -----------------------
@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/")
def root():
    return {"message": "JobAppTracker API", "docs": "/docs", "health": "/health"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
