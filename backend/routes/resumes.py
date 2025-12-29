# ============================================================================
# 4. routes.py - Resumes routes
# ============================================================================

"""
# File: routes.py
"""
from fastapi import APIRouter, Depends, HTTPException, APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlmodel import Session, select
import os
from core.database import get_session, get_db
from core.security import get_current_user
from models import User, Resume
from typing import Optional
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from pathlib import Path
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    tags: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a resume file"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Get file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ['.pdf', '.docx', '.doc']:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are allowed"
            )
        
        # Read file content
        content = await file.read()
        file_size = len(content)  # Capture file size in bytes
        
        # Save file to disk
        uploads_dir = Path("uploads") / str(current_user.id)
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = uploads_dir / file.filename
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Create database record with file_size
        resume = Resume(
            user_id=current_user.id,
            filename=file.filename,
            file_path=str(file_path),
            file_type=file_ext[1:],  # Remove the dot
            file_size=file_size,  # Store the file size
            tags=tags,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        return resume
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
def list_resumes(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Resume).where(Resume.user_id == user.id)).all()


@router.patch("/update/{resume_id}")
async def update_resume(
    resume_id: int,
    file: Optional[UploadFile] = File(None),
    tags: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update resume - can update tags and/or replace file"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Update tags
    if tags is not None:
        resume.tags = tags

    # Replace file if provided
    if file and file.filename:
        try:
            # Validate file
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in ['.pdf', '.docx', '.doc']:
                raise HTTPException(status_code=400, detail="Invalid file type")
            
            # Delete old file
            old_path = Path(resume.file_path)
            if old_path.exists():
                old_path.unlink()
            
            # Save new file
            content = await file.read()
            file_size = len(content)
            
            uploads_dir = Path("uploads") / str(current_user.id)
            uploads_dir.mkdir(parents=True, exist_ok=True)
            
            file_path = uploads_dir / file.filename
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Update resume record
            resume.filename = file.filename
            resume.file_path = str(file_path)
            resume.file_type = file_ext[1:]
            resume.file_size = file_size
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    resume.updated_at = datetime.utcnow()
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return resume
     

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

@router.get("/download/{resume_id}", response_class=FileResponse)
async def download_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download a resume file
    
    - **resume_id**: ID of the resume to download
    
    Returns the file with proper content-type headers
    """
    # Get resume from database
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Construct file path
    file_path = Path(resume.file_path)
    
    # Check if file exists
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found at: {resume.file_path}"
        )
    
    # Determine media type based on file extension
    media_type_map = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
    }
    
    file_extension = file_path.suffix.lower()
    media_type = media_type_map.get(file_extension, 'application/octet-stream')
    
    # Return file response
    return FileResponse(
        path=str(file_path),
        filename=resume.filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{resume.filename}"'
        }
    )


# Alternative: If you want to stream the file (for large files)
@router.get("/stream/{resume_id}")
async def stream_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stream a resume file (better for large files)
    """
    from fastapi.responses import StreamingResponse
    
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    file_path = Path(resume.file_path)
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Stream file
    def iterfile():
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{resume.filename}"'
        }
    )
