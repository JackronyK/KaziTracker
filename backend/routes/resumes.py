# ============================================================================
# 4. routes.py - Resumes routes
# ============================================================================

"""
# File: routes.py
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from fastapi import UploadFile, File
import os
from core.database import get_session
from core.security import get_current_user
from models import User, Resume
from schemas import ResumeResponse
from typing import Optional
import shutil
from parser.parser import extract_resume_text
router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


@router.post("/upload", response_model=ResumeResponse)
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


@router.get("/list")
def list_resumes(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Resume).where(Resume.user_id == user.id)).all()


@router.patch("/update/{resume_id}")
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


@router.delete("/delete/{resume_id}")
def delete_resume(resume_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    r = session.exec(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    if os.path.exists(r.file_path):
        os.remove(r.file_path)
    session.delete(r)
    session.commit()
    return {"detail": "Resume deleted"}
