from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from backend.app.core.database import get_db
from backend.app.routes.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.interview import Interview, InterviewReport
from backend.app.models.analytics import Analytics, InterviewScore

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total Interviews Completed
    total_interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id,
        Interview.status == "completed"
    ).count()

    # Average Score
    avg_score_query = db.query(func.avg(InterviewReport.overall_score)).join(
        Interview, Interview.id == InterviewReport.interview_id
    ).filter(Interview.user_id == current_user.id).scalar()
    
    avg_score = round(float(avg_score_query), 1) if avg_score_query is not None else 0.0

    # Best & Weakest subject from Analytics table
    analytics_records = db.query(Analytics).filter(Analytics.user_id == current_user.id).all()
    best_subject = "N/A"
    weakest_subject = "N/A"
    best_score = -1.0
    weakest_score = 11.0

    # Default categories performance list
    category_scores = {
        "Python": 0.0,
        "DBMS": 0.0,
        "OOP": 0.0,
        "Operating System": 0.0,
        "Computer Networks": 0.0,
        "HR": 0.0
    }

    for rec in analytics_records:
        if rec.subject in category_scores:
            category_scores[rec.subject] = round(rec.average_score, 1)
        
        if rec.average_score > best_score:
            best_score = rec.average_score
            best_subject = rec.subject
            
        if rec.average_score < weakest_score:
            weakest_score = rec.average_score
            weakest_subject = rec.subject

    if best_subject != "N/A":
        best_subject = f"{best_subject} ({round(best_score, 1)}/10)"
    if weakest_subject != "N/A":
        weakest_subject = f"{weakest_subject} ({round(weakest_score, 1)}/10)"

    # Format category performance for charts
    category_performance_data = [
        {"subject": k, "score": v} for k, v in category_scores.items()
    ]

    # Score Trend / Improvement Timeline: scores of the completed interviews sorted chronologically
    score_timeline_db = db.query(Interview.created_at, InterviewReport.overall_score, Interview.job_role).join(
        InterviewReport, Interview.id == InterviewReport.interview_id
    ).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.asc()).all()

    score_trend = []
    for idx, row in enumerate(score_timeline_db):
        score_trend.append({
            "interview_num": idx + 1,
            "date": row.created_at.strftime("%Y-%m-%d"),
            "score": row.overall_score,
            "role": row.job_role
        })

    # Weekly Progress (last 4 weeks)
    weekly_progress = []
    today = datetime.now(timezone.utc)
    for i in range(4, 0, -1):
        start_date = today - timedelta(weeks=i)
        end_date = today - timedelta(weeks=i-1)
        
        count = db.query(Interview).filter(
            Interview.user_id == current_user.id,
            Interview.status == "completed",
            Interview.created_at >= start_date,
            Interview.created_at < end_date
        ).count()
        
        weekly_progress.append({
            "week": f"Week {5-i}",
            "interviews": count
        })

    # Score Distribution count (ranges: 0-4, 5-6, 7-8, 9-10)
    scores = db.query(InterviewReport.overall_score).join(
        Interview, Interview.id == InterviewReport.interview_id
    ).filter(Interview.user_id == current_user.id).all()
    
    ranges = {"0-4": 0, "5-6": 0, "7-8": 0, "9-10": 0}
    for s in scores:
        val = s[0]
        if val <= 4:
            ranges["0-4"] += 1
        elif val <= 6:
            ranges["5-6"] += 1
        elif val <= 8:
            ranges["7-8"] += 1
        else:
            ranges["9-10"] += 1

    score_distribution = [
        {"range": k, "count": v} for k, v in ranges.items()
    ]

    return {
        "total_interviews": total_interviews,
        "average_score": avg_score,
        "best_subject": best_subject,
        "weakest_subject": weakest_subject,
        "category_performance": category_performance_data,
        "score_trend": score_trend,
        "weekly_progress": weekly_progress,
        "score_distribution": score_distribution
    }
