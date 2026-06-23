import json
import logging
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from pypdf import PdfReader
from backend.app.core.database import get_db
from backend.app.routes.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.resume import Resume
from backend.app.schemas.resume import ResumeResponse
from backend.app.services.gemini_service import GeminiService

logger = logging.getLogger("uvicorn.error")
router = APIRouter(prefix="/resumes", tags=["Resume Analyzer"])

def parse_resume_db(resume: Resume) -> ResumeResponse:
    """Helper to convert stored JSON strings back into lists for the schema."""
    return ResumeResponse(
        id=resume.id,
        filename=resume.filename,
        ats_score=resume.ats_score,
        summary=resume.summary,
        missing_skills=json.loads(resume.missing_skills) if resume.missing_skills else [],
        strengths=json.loads(resume.strengths) if resume.strengths else [],
        improvements=json.loads(resume.improvements) if resume.improvements else [],
        suggested_roles=json.loads(resume.suggested_roles) if resume.suggested_roles else [],
        suggested_questions=json.loads(resume.suggested_questions) if resume.suggested_questions else [],
        created_at=resume.created_at
    )

@router.post("/analyze", response_model=ResumeResponse)
def analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )
        
    try:
        # Extract text using PyPDF
        logger.info(f"Parsing uploaded PDF: {file.filename}...")
        pdf_reader = PdfReader(file.file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
            
        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The PDF file appears to be empty or lacks extractable text."
            )
            
        # Analyze with Gemini
        logger.info("Sending extracted text to Gemini API for resume analysis...")
        analysis = GeminiService.analyze_resume(text)
        
        # Save to database
        new_resume = Resume(
            user_id=current_user.id,
            filename=file.filename,
            ats_score=analysis["ats_score"],
            summary=analysis["summary"],
            missing_skills=json.dumps(analysis["missing_skills"]),
            strengths=json.dumps(analysis["strengths"]),
            improvements=json.dumps(analysis["improvements"]),
            suggested_roles=json.dumps(analysis["suggested_roles"]),
            suggested_questions=json.dumps(analysis["suggested_questions"])
        )
        db.add(new_resume)
        
        # Update user's skills and target role if empty or overwrite as helpful suggestions
        if not current_user.target_role and analysis["suggested_roles"]:
            current_user.target_role = analysis["suggested_roles"][0]
        if not current_user.skills and analysis["missing_skills"]:
            # Seed skills based on resume analysis (excluding missing ones or just using strengths)
            current_user.skills = ", ".join(analysis["strengths"][:5])
            
        db.commit()
        db.refresh(new_resume)
        
        return parse_resume_db(new_resume)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to analyze resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing the resume: {str(e)}"
        )

@router.get("/latest", response_model=ResumeResponse)
def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.created_at.desc()).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume uploaded yet."
        )
    return parse_resume_db(resume)
