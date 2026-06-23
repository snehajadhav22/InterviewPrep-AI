from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.routes.auth import get_current_admin
from backend.app.models.user import User
from backend.app.models.interview import Interview, InterviewReport
from backend.app.models.resume import Resume

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

@router.get("/stats")
def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Total Users
    total_users = db.query(User).count()

    # Total Interviews Completed
    total_interviews = db.query(Interview).filter(Interview.status == "completed").count()

    # Active Users (Users who have taken at least one interview)
    active_users = db.query(User).join(Interview, User.id == Interview.user_id).distinct().count()

    # Total Resumes Uploaded
    total_resumes = db.query(Resume).count()

    # System average score
    avg_score_query = db.query(func.avg(InterviewReport.overall_score)).scalar()
    system_avg_score = round(float(avg_score_query), 1) if avg_score_query is not None else 0.0

    # User List with details for Admin Panel grid
    users_db = db.query(User).all()
    user_details = []
    
    for u in users_db:
        # Count interviews for user
        u_interviews = db.query(Interview).filter(Interview.user_id == u.id).count()
        # Get latest resume ATS score
        latest_res = db.query(Resume).filter(Resume.user_id == u.id).order_by(Resume.created_at.desc()).first()
        
        user_details.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "target_role": u.target_role or "Not Set",
            "interviews_count": u_interviews,
            "ats_score": latest_res.ats_score if latest_res else None,
            "is_admin": u.is_admin,
            "created_at": u.created_at
        })

    return {
        "stats": {
            "total_users": total_users,
            "total_interviews": total_interviews,
            "active_users": active_users,
            "total_resumes": total_resumes,
            "system_avg_score": system_avg_score
        },
        "users": user_details
    }
