# ============================================================================
# 2. schemas/job.py
# ============================================================================
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


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
    description: Optional[str]
    apply_url: Optional[str] = None
    confidence: float

class JobInput(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    description: Optional[str]
    apply_url: Optional[str] = None
    parsed_skills: Optional[str] = None
    seniority_level: Optional[str] = None
    source: Optional[str] = None


class JobResponse(JobInput):
    id: int
    created_at: datetime