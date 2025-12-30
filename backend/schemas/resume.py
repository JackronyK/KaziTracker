# ============================================================================
# 4. schemas/resume.py
# ============================================================================
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    tags: Optional[str] = None
    extracted_text: Optional[str] = None
    uploaded_at: datetime