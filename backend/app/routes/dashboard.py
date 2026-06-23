from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.routes.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.interview import Interview, InterviewReport
from backend.app.models.analytics import Analytics
from backend.app.models.resume import Resume

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total Interviews Taken
    total_interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id,
        Interview.status == "completed"
    ).count()
    
    # Average Score
    avg_score_query = db.query(func.avg(InterviewReport.overall_score)).join(
        Interview, Interview.id == InterviewReport.interview_id
    ).filter(Interview.user_id == current_user.id).scalar()
    
    avg_score = round(float(avg_score_query), 1) if avg_score_query is not None else 0.0
    
    # Best and Weakest Subject from Analytics
    subjects = db.query(Analytics).filter(Analytics.user_id == current_user.id).all()
    
    best_subject = "N/A"
    weakest_subject = "N/A"
    
    if subjects:
        # Sort subjects by average score
        sorted_subjects = sorted(subjects, key=lambda x: x.average_score)
        weakest_subject = f"{sorted_subjects[0].subject} ({round(sorted_subjects[0].average_score, 1)}/10)"
        best_subject = f"{sorted_subjects[-1].subject} ({round(sorted_subjects[-1].average_score, 1)}/10)"
        
    # Recent Activity: past 5 interviews
    recent_interviews_db = db.query(Interview).filter(
        Interview.user_id == current_user.id
    ).order_by(Interview.created_at.desc()).limit(5).all()
    
    recent_activity = []
    for iv in recent_interviews_db:
        score = 0.0
        if iv.report:
            score = iv.report.overall_score
            
        recent_activity.append({
            "id": iv.id,
            "job_role": iv.job_role,
            "experience_level": iv.experience_level,
            "interview_type": iv.interview_type,
            "status": iv.status,
            "score": score,
            "created_at": iv.created_at
        })
        
    # Check if a resume is uploaded
    resume_uploaded = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    
    return {
        "total_interviews": total_interviews,
        "average_score": avg_score,
        "best_category": best_subject,
        "weakest_category": weakest_subject,
        "recent_activity": recent_activity,
        "resume_status": {
            "uploaded": resume_uploaded is not None,
            "ats_score": resume_uploaded.ats_score if resume_uploaded else None,
            "filename": resume_uploaded.filename if resume_uploaded else None
        }
    }
