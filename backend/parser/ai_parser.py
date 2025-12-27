"""
AI-Powered JD Parser: Gemini AI (primary) + Rule-based (fallback)
Uses Google Gemini for intelligent extraction with rule-based backup.
"""

import re
import os
import json
import logging
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv("../backend.env")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Check and Import Google Gemini
GEMINI_AVAILABLE = False
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    logger.warning("⚠️ google-generativeai not installed. Install with: pip install google-generativeai")

# -----------------------------------------------------------------------------
# CONSTANTS & PATTERNS
# -----------------------------------------------------------------------------

COMMON_SKILLS = {
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "sql",
    "react", "vue", "angular", "nodejs", "fastapi", "django", "flask", "spring",
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "git", "linux", "shell", "bash", "machine learning", "nlp", "pytorch", "tensorflow",
    "html", "css", "tailwind", "bootstrap", "figma", "sketch",
}

SENIORITY_PATTERNS = {
    "entry": [r"entry.{0,5}level", r"junior", r"fresh", r"graduate", r"0.{0,5}2\s+years"],
    "mid": [r"mid.{0,5}level", r"mid-senior", r"intermediate", r"3.{0,5}7\s+years"],
    "senior": [r"senior", r"staff", r"principal", r"lead", r"8\+\s+years", r"10\+\s+years"],
}

# -----------------------------------------------------------------------------
# PARSER CLASS
# -----------------------------------------------------------------------------

class AIJDParser:
    """
    AI-Powered Job Description Parser
    Primary: Google Gemini AI (Flash Model)
    Fallback: Regex/Rule-based extraction
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the parser with Gemini API key.
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.ai_available = True
        self.model = None

        if GEMINI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                
                # USE GEMINI 1.5 FLASH (Fast, Cheap, High Context)
                # Note: 'gemini-2.5-flash' does not exist yet.
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                
                self.ai_available = True
                logger.info("✅ Gemini AI initialized successfully (Model: gemini-2.5-flash)")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini: {e}")
                self.ai_available = False
        else:
            if not self.api_key:
                logger.warning("⚠️ GEMINI_API_KEY is missing. AI features disabled.")
            elif not GEMINI_AVAILABLE:
                logger.warning("⚠️ Google SDK not found. AI features disabled.")

    def parse(self, jd_text: str, url: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse job description using AI (primary) or rules (fallback).
        """
        if not jd_text or not jd_text.strip():
            logger.error("❌ Empty JD text provided")
            return {}

        logger.info("🔍 Starting job description parsing...")
        
        # 1. Try AI extraction
        if self.ai_available:
            try:
                logger.info("🤖 Attempting AI extraction with Gemini...")
                result = self._parse_with_ai(jd_text, url)
                
                # Sanity check: Ensure we got at least a title or skills
                if result and (result.get('title') or result.get('skills')):
                    result['method'] = 'ai'
                    logger.info(f"✅ AI extraction successful (confidence: {result.get('confidence', 0):.2f})")
                    return result
                else:
                    logger.warning("⚠️ AI extraction returned empty/invalid data, falling back...")
            except Exception as e:
                logger.error(f"❌ AI extraction failed: {e}. Falling back to rule-based.")
        
        # 2. Fallback to Rules
        logger.info("📋 Using rule-based fallback extraction...")
        result = self._parse_with_rules(jd_text, url)
        result['method'] = 'rules'
        logger.info(f"✅ Rule-based extraction complete")
        return result

    def _parse_with_ai(self, jd_text: str, url: Optional[str]) -> Dict[str, Any]:
        """
        Parse job description using Gemini AI with JSON enforcement.
        """
        prompt = f"""
        You are an expert HR Parser. Extract structured data from this Job Description.
        
        JOB DESCRIPTION:
        {jd_text[:8000]} 
        
        INSTRUCTIONS:
        1. Extract the following fields into a strictly valid JSON object.
        2. If a value is not found, return null (do not make it up).
        3. 'skills' must be a list of technical strings (lowercase).
        4. 'seniority_level' must strictly be one of: "entry", "mid", "senior", or null.
        
        REQUIRED JSON STRUCTURE:
        {{
            "title": "string",
            "company": "string",
            "location": "string",
            "salary_range": "string",
            "seniority_level": "string",
            "skills": ["string", "string"],
            "description": "short summary string",
            "apply_url": "string",
            "confidence": float (0.0 to 1.0)
        }}
        """

        try:
            # Enforce JSON MIME type for stability
            generation_config = genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1  # Low temperature for factual extraction
            )
            
            response = self.model.generate_content(
                prompt, 
                generation_config=generation_config
            )
            
            # Parsing the JSON response
            parsed = json.loads(response.text)
            
            # Post-processing / Validation
            result = {
                'title': parsed.get('title') or 'Unknown Position',
                'company': parsed.get('company') or 'Unknown Company',
                'location': parsed.get('location'),
                'salary_range': parsed.get('salary_range'),
                'seniority_level': parsed.get('seniority_level'),
                'skills': parsed.get('skills', []),
                'description': parsed.get('description', jd_text[:300]),
                'apply_url': parsed.get('apply_url') or url,
                'confidence': float(parsed.get('confidence', 0.85))
            }
            
            # Normalize seniority just in case
            if result['seniority_level'] not in ['entry', 'mid', 'senior']:
                result['seniority_level'] = None
                
            return result

        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            raise e

    def _parse_with_rules(self, jd_text: str, url: Optional[str]) -> Dict[str, Any]:
        """
        Regex-based fallback extraction.
        """
        normalized = jd_text.lower().strip()
        
        return {
            'title': self._extract_title(jd_text),
            'company': self._extract_company(jd_text),
            'location': self._extract_location(normalized),
            'salary_range': self._extract_salary(normalized),
            'seniority_level': self._extract_seniority(normalized),
            'skills': self._extract_skills(normalized),
            'description': jd_text[:500].strip(),
            'apply_url': self._extract_apply_url(normalized) or url,
            'confidence': 0.45,  # Rules are generally less confident
        }

    # --- Rule Helpers ---
    def _extract_title(self, text: str) -> str:
        lines = text.split('\n')
        for line in lines[:5]:
            clean = line.strip()
            # Heuristic: Title is usually short, not a URL, and not a generic header
            if 5 < len(clean) < 80 and "http" not in clean:
                 # Remove labels like "Job Title:"
                return re.sub(r"^(job|position|role|hiring)[:\s]*", "", clean, flags=re.I).strip()
        return "Unknown Position"

    def _extract_company(self, text: str) -> str:
        match = re.search(r"(?:at|for)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+is\s+hiring|[\.,\n])", text)
        return match.group(1).strip() if match else "Unknown Company"

    def _extract_location(self, text: str) -> Optional[str]:
        patterns = [r"(?:location|based in):\s*([^,\n]+)", r"(remote|hybrid|on-site)"]
        for p in patterns:
            if m := re.search(p, text): return m.group(1).strip().title()
        return None

    def _extract_salary(self, text: str) -> Optional[str]:
        # Matches KSh, $, etc.
        pattern = r"([\$ksh]+[\d,]+(?:\s*-\s*[\d,]+)?)"
        if m := re.search(pattern, text): return m.group(1).upper()
        return None

    def _extract_seniority(self, text: str) -> Optional[str]:
        for level, patterns in SENIORITY_PATTERNS.items():
            for p in patterns:
                if re.search(p, text): return level
        return None

    def _extract_skills(self, text: str) -> List[str]:
        return sorted([s for s in COMMON_SKILLS if re.search(rf"\b{re.escape(s)}\b", text)])

    def _extract_apply_url(self, text: str) -> Optional[str]:
        urls = re.findall(r"https?://[^\s<>\"']+", text)
        return urls[0] if urls else None


# =============================================================================
# USAGE EXAMPLE
# =============================================================================

if __name__ == "__main__":
    # Test Data
    sample_jd = """
    Senior Backend Engineer
    Acme Corp is looking for a Senior Python Developer.
    Location: Remote (US/EU)
    Salary: $120,000 - $160,000
    
    Requirements:
    - 5+ years of Python and Django experience
    - Experience with AWS and Docker
    - Knowledge of PostgreSQL
    
    Apply here: https://acme.com/jobs/123
    """
    
    # Init Parser
    parser = AIJDParser()
    
    # Run
    result = parser.parse(sample_jd)
    
    # Output
    print(json.dumps(result, indent=2))