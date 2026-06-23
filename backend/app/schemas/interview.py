from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InterviewStart(BaseModel):
    job_role: str
    experience_level: str
    interview_type: str  # Technical, HR, Mixed

class InterviewAnswer(BaseModel):
    answer: str

class InterviewQuestionResponse(BaseModel):
    id: int
    question_text: str
    user_answer: Optional[str] = None
    score: Optional[int] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    better_answer: Optional[str] = None
    suggestions: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewReportResponse(BaseModel):
    id: int
    interview_id: int
    overall_score: float
    summary: str
    career_suggestions: Optional[str] = None
    learning_recommendations: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewSessionResponse(BaseModel):
    id: int
    job_role: str
    experience_level: str
    interview_type: str
    status: str
    created_at: datetime
    questions: List[InterviewQuestionResponse] = []
    report: Optional[InterviewReportResponse] = None

    class Config:
        from_attributes = True

class SubjectScoreResponse(BaseModel):
    subject: str
    score: int
    max_score: int
    created_at: datetime

    class Config:
        from_attributes = True
