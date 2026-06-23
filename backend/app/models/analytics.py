from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class InterviewScore(Base):
    __tablename__ = "interview_scores"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String, nullable=False)  # Python, DBMS, OOP, Operating System, Computer Networks, HR
    score = Column(Integer, nullable=False)
    max_score = Column(Integer, default=10)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String, nullable=False)  # Python, DBMS, OOP, Operating System, Computer Networks, HR
    average_score = Column(Float, default=0.0)
    total_interviews = Column(Integer, default=0)
    last_tested = Column(DateTime, default=lambda: datetime.now(timezone.utc))
