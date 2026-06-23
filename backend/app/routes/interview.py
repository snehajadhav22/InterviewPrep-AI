import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.app.core.database import get_db
from backend.app.routes.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.interview import Interview, InterviewQuestion, InterviewReport
from backend.app.models.analytics import InterviewScore, Analytics
from backend.app.schemas.interview import (
    InterviewStart, InterviewAnswer, InterviewSessionResponse, 
    InterviewQuestionResponse, InterviewReportResponse
)
from backend.app.services.gemini_service import GeminiService

logger = logging.getLogger("uvicorn.error")
router = APIRouter(prefix="/interviews", tags=["Interview System"])

def update_user_analytics(db: Session, user_id: int, subject: str, score: int):
    """Utility to update aggregate subject scores in the Analytics table."""
    analytics = db.query(Analytics).filter(
        Analytics.user_id == user_id,
        Analytics.subject == subject
    ).first()
    
    if not analytics:
        analytics = Analytics(
            user_id=user_id,
            subject=subject,
            average_score=float(score),
            total_interviews=1,
            last_tested=func.now()
        )
        db.add(analytics)
    else:
        total = analytics.total_interviews
        new_avg = ((analytics.average_score * total) + score) / (total + 1)
        analytics.average_score = new_avg
        analytics.total_interviews = total + 1
        analytics.last_tested = func.now()
    db.commit()

@router.post("/start", response_model=InterviewSessionResponse)
def start_interview(
    session_in: InterviewStart,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create new Interview session
    new_session = Interview(
        user_id=current_user.id,
        job_role=session_in.job_role,
        experience_level=session_in.experience_level,
        interview_type=session_in.interview_type,
        status="in_progress"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    # Generate the very first question
    logger.info(f"Generating first question for interview {new_session.id}...")
    ai_q = GeminiService.generate_question(
        job_role=new_session.job_role,
        experience_level=new_session.experience_level,
        interview_type=new_session.interview_type,
        previous_questions=[]
    )
    
    first_question = InterviewQuestion(
        interview_id=new_session.id,
        question_text=ai_q["question"],
        suggestions=ai_q["subject"]  # Temporarily store the subject in the suggestions field or query
    )
    db.add(first_question)
    
    # Save a record of the score association in InterviewScore with initial 0 score
    new_score_rec = InterviewScore(
        interview_id=new_session.id,
        subject=ai_q["subject"],
        score=0
    )
    db.add(new_score_rec)
    
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/history", response_model=List[InterviewSessionResponse])
def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = db.query(Interview).filter(
        Interview.user_id == current_user.id
    ).order_by(Interview.created_at.desc()).all()
    return history

@router.get("/{interview_id}", response_model=InterviewSessionResponse)
def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    return session

@router.post("/{interview_id}/answer")
def submit_answer(
    interview_id: int,
    ans_in: InterviewAnswer,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch interview session
    session = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Interview is already completed")
        
    # Get current question (the last question in the session that does not have an answer yet)
    current_question = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview_id,
        InterviewQuestion.user_answer == None
    ).order_by(InterviewQuestion.id.asc()).first()
    
    if not current_question:
        raise HTTPException(status_code=400, detail="No active question waiting for an answer")
        
    # Determine the subject category
    # (We stored it in suggestions field when we generated the question)
    subject = current_question.suggestions if current_question.suggestions else "HR"
    
    # Evaluate with Gemini
    logger.info(f"Evaluating answer for question ID {current_question.id}...")
    evaluation = GeminiService.evaluate_answer(
        question=current_question.question_text,
        user_answer=ans_in.answer,
        job_role=session.job_role,
        subject=subject
    )
    
    # Update the question details
    current_question.user_answer = ans_in.answer
    current_question.score = evaluation["score"]
    current_question.strengths = evaluation["strengths"]
    current_question.weaknesses = evaluation["weaknesses"]
    current_question.better_answer = evaluation["better_answer"]
    current_question.suggestions = evaluation["suggestions"] # Overwrite temp subject with actual suggestions
    
    # Update InterviewScore table for this interview
    score_rec = db.query(InterviewScore).filter(
        InterviewScore.interview_id == interview_id,
        InterviewScore.subject == subject
    ).order_by(InterviewScore.id.desc()).first()
    
    if score_rec:
        score_rec.score = evaluation["score"]
    else:
        # Create one if missing
        score_rec = InterviewScore(
            interview_id=interview_id,
            subject=subject,
            score=evaluation["score"]
        )
        db.add(score_rec)
        
    db.commit()
    
    # Update aggregate User Analytics
    update_user_analytics(db, current_user.id, subject, evaluation["score"])
    
    # Count current answered questions
    answered_count = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview_id,
        InterviewQuestion.user_answer != None
    ).count()
    
    # Check if we should generate a next question or complete
    MAX_QUESTIONS = 5
    has_next = answered_count < MAX_QUESTIONS
    next_question_data = None
    
    if has_next:
        # Fetch previous question texts to avoid duplicate questions
        prev_questions = db.query(InterviewQuestion.question_text).filter(
            InterviewQuestion.interview_id == interview_id
        ).all()
        prev_list = [q[0] for q in prev_questions]
        
        logger.info(f"Generating next question (number {answered_count + 1})...")
        ai_q = GeminiService.generate_question(
            job_role=session.job_role,
            experience_level=session.experience_level,
            interview_type=session.interview_type,
            previous_questions=prev_list
        )
        
        next_question = InterviewQuestion(
            interview_id=interview_id,
            question_text=ai_q["question"],
            suggestions=ai_q["subject"]  # Temp store subject
        )
        db.add(next_question)
        
        # Save a score record for the next subject
        new_score_rec = InterviewScore(
            interview_id=interview_id,
            subject=ai_q["subject"],
            score=0
        )
        db.add(new_score_rec)
        
        db.commit()
        db.refresh(next_question)
        next_question_data = {
            "id": next_question.id,
            "question_text": next_question.question_text
        }
        
    return {
        "evaluation": {
            "score": evaluation["score"],
            "strengths": evaluation["strengths"],
            "weaknesses": evaluation["weaknesses"],
            "better_answer": evaluation["better_answer"],
            "suggestions": evaluation["suggestions"]
        },
        "has_next": has_next,
        "next_question": next_question_data
    }

@router.post("/{interview_id}/complete", response_model=InterviewReportResponse)
def complete_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch interview session
    session = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    # Calculate average score of all answered questions
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview_id,
        InterviewQuestion.user_answer != None
    ).all()
    
    if not questions:
        raise HTTPException(status_code=400, detail="Cannot complete an interview with no answers")
        
    total_score = sum([q.score for q in questions if q.score is not None])
    overall_score = round(total_score / len(questions), 1)
    
    # Format questions and answers for Gemini summary report
    qa_list = []
    for q in questions:
        qa_list.append({
            "question": q.question_text,
            "answer": q.user_answer,
            "score": q.score
        })
        
    logger.info(f"Generating interview report for interview ID {interview_id}...")
    report_data = GeminiService.generate_report(qa_list, session.job_role)
    
    # Check if a report already exists
    report = db.query(InterviewReport).filter(InterviewReport.interview_id == interview_id).first()
    if not report:
        report = InterviewReport(
            interview_id=interview_id,
            overall_score=overall_score,
            summary=report_data["summary"],
            career_suggestions=report_data["career_suggestions"],
            learning_recommendations=report_data["learning_recommendations"]
        )
        db.add(report)
    else:
        report.overall_score = overall_score
        report.summary = report_data["summary"]
        report.career_suggestions = report_data["career_suggestions"]
        report.learning_recommendations = report_data["learning_recommendations"]
        
    session.status = "completed"
    db.commit()
    db.refresh(report)
    return report
