from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    ats_score = Column(Integer, nullable=False)
    summary = Column(Text, nullable=False)
    missing_skills = Column(Text, nullable=True)     # Store as JSON string or comma-separated
    strengths = Column(Text, nullable=True)          # Store as JSON string
    improvements = Column(Text, nullable=True)        # Store as JSON string
    suggested_roles = Column(Text, nullable=True)     # Store as JSON string
    suggested_questions = Column(Text, nullable=True) # Store as JSON string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="resumes")
