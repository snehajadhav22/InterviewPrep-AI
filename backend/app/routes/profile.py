from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.routes.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.user import UserUpdate, UserResponse
from backend.app.core.security import get_password_hash

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("/", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/", response_model=UserResponse)
def update_profile(
    profile_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_in.email is not None and profile_in.email != current_user.email:
        # Check if email is already taken
        existing_email = db.query(User).filter(User.email == profile_in.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use by another account."
            )
        current_user.email = profile_in.email

    if profile_in.name is not None:
        current_user.name = profile_in.name
    if profile_in.skills is not None:
        current_user.skills = profile_in.skills
    if profile_in.education is not None:
        current_user.education = profile_in.education
    if profile_in.target_role is not None:
        current_user.target_role = profile_in.target_role
    if profile_in.password is not None and profile_in.password.strip() != "":
        current_user.hashed_password = get_password_hash(profile_in.password)

    db.commit()
    db.refresh(current_user)
    return current_user
