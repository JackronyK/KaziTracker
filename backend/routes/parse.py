# backend/app/routers/parse.py
"""
Parser Router - AI-powered job description parsing
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional
import logging

from parser.ai_parser import AIJDParser
from core.security import get_current_user  # Your auth dependency
from models import User

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize parser (singleton)
_parser_instance: Optional[AIJDParser] = None

def get_parser() -> AIJDParser:
    """Get or create parser instance."""
    global _parser_instance
    if _parser_instance is None:
        _parser_instance = AIJDParser()
    return _parser_instance


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class ParseJDRequest(BaseModel):
    """Request model for JD parsing."""
    raw_jd: str = Field(..., min_length=10, max_length=10000, description="Raw job description text")
    url: Optional[str] = Field(None, max_length=500, description="Optional job posting URL")
    use_llm: bool = Field(True, description="Whether to use AI (True) or rules only (False)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "raw_jd": "Senior Software Engineer at TechCorp\n\nWe're looking for...",
                "url": "https://techcorp.com/careers/123",
                "use_llm": True
            }
        }


class ParseJDResponse(BaseModel):
    """Response model for parsed JD."""
    title: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    seniority_level: Optional[str] = None
    skills: list[str] = []
    description: str
    apply_url: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    method: str  # 'ai' or 'rules'
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Senior Software Engineer",
                "company": "TechCorp",
                "location": "Nairobi, Kenya (Hybrid)",
                "salary_range": "KSh 200,000 - 350,000",
                "seniority_level": "senior",
                "skills": ["python", "react", "typescript", "aws", "docker"],
                "description": "We're looking for a Senior Software Engineer...",
                "apply_url": "https://techcorp.com/careers/apply",
                "confidence": 0.95,
                "method": "ai"
            }
        }


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.post(
    "/jd",
    response_model=ParseJDResponse,
    summary="Parse Job Description",
    description="Extract structured information from a job description using AI or rule-based parsing",
    status_code=status.HTTP_200_OK,
)
async def parse_job_description(
    request: ParseJDRequest,
    current_user: User = Depends(get_current_user),
) -> ParseJDResponse:
    """
    Parse a job description and extract structured fields.
    
    **Process:**
    1. If `use_llm=True`, tries AI extraction first (Gemini)
    2. Falls back to rule-based extraction if AI fails or quota exceeded
    3. Returns structured data with confidence score
    
    **AI Method:**
    - Uses Google Gemini (free tier)
    - High accuracy (85-95% confidence)
    - Handles complex, unstructured text
    
    **Rule-based Method:**
    - Regex pattern matching
    - Fast and reliable fallback
    - Lower accuracy (65-75% confidence)
    """
    try:
        logger.info(f"Parsing JD for user {current_user.email} (use_llm={request.use_llm})")
        
        parser = get_parser()
        
        # If user explicitly wants rules only, force it
        if not request.use_llm:
            parser_temp = AIJDParser()  # Create new instance without AI
            parser_temp.ai_available = False
            result = parser_temp.parse(request.raw_jd, request.url)
        else:
            # Use normal parser (AI with fallback)
            result = parser.parse(request.raw_jd, request.url)
        
        logger.info(
            f"JD parsed successfully: method={result['method']}, "
            f"confidence={result['confidence']:.2f}"
        )
        
        return ParseJDResponse(**result)
        
    except ValueError as e:
        logger.error(f"Validation error in JD parsing: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid job description: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in JD parsing: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse job description. Please try again."
        )


@router.get(
    "/health",
    summary="Check Parser Health",
    description="Check if AI parsing is available",
)
async def parser_health(
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Check parser health and AI availability.
    
    Returns:
        - ai_available: Whether Gemini AI is configured and working
        - method: Primary parsing method being used
        - fallback_available: Whether rule-based fallback is available
    """
    parser = get_parser()
    
    return {
        "status": "healthy",
        "ai_available": parser.ai_available,
        "method": "ai" if parser.ai_available else "rules",
        "fallback_available": True,
        "model": "gemini-1.5-flash" if parser.ai_available else None,
    }


# =============================================================================
# REGISTER ROUTER IN MAIN APP
# =============================================================================

# In your main.py or app/main.py:
"""
from fastapi import FastAPI
from app.routers import parse

app = FastAPI()

# Include parser router
app.include_router(parse.router)
"""