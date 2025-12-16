"""
Hybrid JD Parser: Rule-based extraction + optional LLM fallback
"""

import re
from typing import Optional
import json

# Skill keywords library (expandable)
COMMON_SKILLS = {
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "sql",
    "react", "vue", "angular", "nodejs", "fastapi", "django", "flask", "spring",
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "git", "linux", "shell", "bash", "machine learning", "nlp", "pytorch", "tensorflow",
}

# Seniority indicators
SENIORITY_PATTERNS = {
    "entry": [r"entry.{0,5}level", r"junior", r"fresh", r"graduate", r"0.{0,5}2\s+years"],
    "mid": [r"mid.{0,5}level", r"mid-senior", r"intermediate", r"3.{0,5}7\s+years"],
    "senior": [r"senior", r"staff", r"principal", r"lead", r"8\+\s+years", r"10\+\s+years"],
}

# Location patterns
LOCATION_PATTERNS = [
    r"(?:based in|located in|office in|remote|hybrid|on-site)\s+([^,.\n]+)",
    r"^([\w\s]+,\s*[\w\s]+)$",  # City, Country
]

# Salary patterns
SALARY_PATTERNS = [
    r"(\$[\d,]+)\s*(?:[-–]|to)\s*(\Ksh[\d,]+)",  # $100,000 - $150,000
    r"(\$[\d,]+)\s*(?:k|K)",  # $100k
    r"([\d,]+)\s*(?:[-–]|to)\s*([\d,]+)\s*(?:usd|eur|gbp|ksh|kshs)",  # 100000 - 150000 USD
]

# Apply link patterns
APPLY_PATTERNS = [
    r"(?:apply|apply now|apply here)\s*(?:at|via|on)?\s*([^\s\n]+(?:\.com|\.io|\.org|\.net|\.co\.uk))",
    r"https?://[^\s\n<>]+",  # Any URL
]

class JDParser:
    """Hybrid rule-based + optional LLM JD parser."""
    
    def __init__(self, use_llm: bool = False, llm_model: Optional[str] = None):
        """
        Args:
            use_llm: If True, use LLM for fallback/validation.
            llm_model: Model to use ('openai', 'huggingface', etc.)
        """
        self.use_llm = use_llm
        self.llm_model = llm_model
    
    def parse(self, jd_text: str, url: Optional[str] = None) -> dict:
        """
        Parse job description and extract structured fields.
        
        Args:
            jd_text: Raw job description text
            url: Optional URL for tracking source
            
        Returns:
            {
                'title': str,
                'company': str,
                'location': str | None,
                'salary_range': str | None,
                'seniority_level': str | None,
                'skills': [str],
                'description': str,
                'apply_url': str | None,
                'confidence': float,  # 0.0 - 1.0
            }
        """
        # Normalize text
        normalized = jd_text.lower().strip()
        
        # Run rule-based extraction
        result = {
            'title': self._extract_title(normalized, jd_text),
            'company': self._extract_company(normalized, jd_text),
            'location': self._extract_location(normalized),
            'salary_range': self._extract_salary(normalized),
            'seniority_level': self._extract_seniority(normalized),
            'skills': self._extract_skills(normalized),
            'description': jd_text[:500],  # Truncate for storage
            'apply_url': self._extract_apply_url(normalized),
            'confidence': 0.75,  # Baseline for rule-based
        }
        
        # If LLM enabled and confidence is low, try LLM extraction
        if self.use_llm and result['confidence'] < 0.8:
            llm_result = self._llm_parse(jd_text)
            if llm_result:
                # Merge LLM results for low-confidence fields
                result = self._merge_results(result, llm_result)
                result['confidence'] = min(0.95, result['confidence'] + 0.15)
        
        return result
    
    def _extract_title(self, text_lower: str, text_orig: str) -> str:
        """Extract job title from first line or heading-like text."""
        lines = text_orig.split('\n')
        
        # Try first non-empty line
        for line in lines[:5]:
            line = line.strip()
            if len(line) > 5 and len(line) < 100:
                # Remove common prefixes
                title = re.sub(r"^(job|position|role|hiring)[:\s]*", "", line, flags=re.I).strip()
                if title and len(title) < 80:
                    return title
        
        return "Software Engineer"  # Fallback
    
    def _extract_company(self, text_lower: str, text_orig: str) -> str:
        """Extract company name."""
        # Common patterns: "at Company", "Company is", "Company is hiring"
        patterns = [
            r"(?:at|for|with)\s+([A-Z][A-Za-z\s&,.-]+?)(?:\s|,|\.|—|is|hiring)",
            r"^([A-Z][A-Za-z\s&]+?)(?:\sis\s|hiring|are\s)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text_orig[:500])
            if match:
                company = match.group(1).strip()
                if len(company) < 50 and company not in ["The", "We"]:
                    return company
        
        return "Company"  # Fallback
    
    def _extract_location(self, text_lower: str) -> Optional[str]:
        """Extract job location."""
        for pattern in LOCATION_PATTERNS:
            match = re.search(pattern, text_lower, re.I)
            if match:
                location = match.group(1).strip()
                if len(location) < 60:
                    return location
        
        # Check for "remote"
        if re.search(r"\b(remote|work\s+from\s+home|wfh)\b", text_lower):
            return "Remote"
        
        return None
    
    def _extract_salary(self, text_lower: str) -> Optional[str]:
        """Extract salary range."""
        for pattern in SALARY_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                if len(match.groups()) == 2:
                    return f"{match.group(1)} - {match.group(2)}"
                elif len(match.groups()) == 1:
                    return match.group(1)
        
        return None
    
    def _extract_seniority(self, text_lower: str) -> Optional[str]:
        """Detect seniority level."""
        for level, patterns in SENIORITY_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return level
        
        return None
    
    def _extract_skills(self, text_lower: str) -> list[str]:
        """Extract technical skills."""
        found_skills = set()
        
        for skill in COMMON_SKILLS:
            # Whole-word match to avoid false positives
            pattern = r"\b" + re.escape(skill) + r"\b"
            if re.search(pattern, text_lower):
                found_skills.add(skill)
        
        return sorted(list(found_skills))
    
    def _extract_apply_url(self, text_lower: str) -> Optional[str]:
        """Extract application URL."""
        # Find URLs
        urls = re.findall(r"https?://[^\s<>\"]+", text_lower)
        
        if urls:
            # Prefer URLs with "apply", "careers", "job"
            priority_urls = [u for u in urls if any(x in u for x in ["apply", "careers", "job"])]
            return priority_urls[0] if priority_urls else urls[0]
        
        return None
    
    def _llm_parse(self, jd_text: str) -> Optional[dict]:
        """
        Use LLM to extract fields (requires API key).
        This is a stub; implement with your LLM provider.
        """
        try:
            if self.llm_model == "openai":
                return self._parse_with_openai(jd_text)
            elif self.llm_model == "huggingface":
                return self._parse_with_huggingface(jd_text)
        except Exception as e:
            print(f"LLM parsing failed: {e}")
            return None
    
    def _parse_with_openai(self, jd_text: str) -> Optional[dict]:
        """Parse using OpenAI API (stub)."""
        # TODO: Implement with OpenAI client
        # This requires OPENAI_API_KEY env var and openai library
        return None
    
    def _parse_with_huggingface(self, jd_text: str) -> Optional[dict]:
        """Parse using HuggingFace transformers (stub)."""
        # TODO: Implement with HuggingFace models
        return None
    
    def _merge_results(self, rule_result: dict, llm_result: dict) -> dict:
        """Merge rule-based and LLM results, preferring LLM where confidence is high."""
        merged = rule_result.copy()
        
        # For fields where LLM has high confidence, use LLM result
        for key in ['title', 'company', 'location', 'salary_range']:
            if key in llm_result and llm_result[key]:
                merged[key] = llm_result[key]
        
        # Merge skills (combine both)
        if 'skills' in llm_result:
            merged['skills'] = list(set(merged['skills'] + llm_result['skills']))
        
        return merged


# =============================================================================
# RESUME TEXT EXTRACTOR
# =============================================================================

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pdfminer.six."""
    try:
        from pdfminer.high_level import extract_text
        return extract_text(file_path)
    except ImportError:
        print("pdfminer.six not installed. Install with: pip install pdfminer.six")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX using python-docx."""
    try:
        from docx import Document
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except ImportError:
        print("python-docx not installed. Install with: pip install python-docx")
        return ""

def extract_resume_text(file_path: str, file_type: str) -> str:
    """Extract text from resume (PDF or DOCX)."""
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == "docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


# =============================================================================
# USAGE EXAMPLE
# =============================================================================

if __name__ == "__main__":
    # Test JD parsing
    sample_jd = """
    Senior Software Engineer
    
    Company: TechCorp
    Location: San Francisco, CA (Hybrid)
    Salary: $150,000 - $200,000
    
    We're looking for a Senior Software Engineer with 5+ years of experience.
    You should be proficient in Python, React, and AWS.
    
    Apply at: https://techcorp.com/careers/apply
    """
    
    parser = JDParser(use_llm=False)
    result = parser.parse(sample_jd)
    print(json.dumps(result, indent=2))