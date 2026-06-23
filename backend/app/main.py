import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings

# Import database engine and Base
from backend.app.core.database import engine, Base

# Import all models to ensure they register on metadata before creation
from backend.app.models.user import User
from backend.app.models.interview import Interview, InterviewQuestion, InterviewReport
from backend.app.models.resume import Resume
from backend.app.models.analytics import InterviewScore, Analytics

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered interview preparation platform APIs.",
    version="1.0.0"
)

# Set up CORS middleware to allow connection from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from backend.app.routes import auth, dashboard, interview, resume, analytics, profile, admin

# Register routes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(interview.router, prefix=settings.API_V1_STR)
app.include_router(resume.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the InterviewPrep AI API. Health check passed."
    }

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
