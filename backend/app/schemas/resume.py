from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    filename: str
    ats_score: int
    summary: str
    missing_skills: List[str] = []
    strengths: List[str] = []
    improvements: List[str] = []
    suggested_roles: List[str] = []
    suggested_questions: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True
