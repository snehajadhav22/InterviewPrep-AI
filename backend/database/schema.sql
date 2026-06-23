-- PostgreSQL Relational Schema for InterviewPrep AI
-- Compatible with PostgreSQL 12+

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    skills TEXT, -- Comma-separated or JSON list of skills
    education VARCHAR(255),
    target_role VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    experience_level VARCHAR(255) NOT NULL,
    interview_type VARCHAR(255) NOT NULL, -- Technical, HR, Mixed
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interviews_user ON interviews(user_id);

-- 3. Interview Questions Table
CREATE TABLE IF NOT EXISTS interview_questions (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    user_answer TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 10),
    strengths TEXT,
    weaknesses TEXT,
    better_answer TEXT,
    suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_interview ON interview_questions(interview_id);

-- 4. Interview Reports Table
CREATE TABLE IF NOT EXISTS interview_reports (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER UNIQUE NOT NULL,
    overall_score NUMERIC(3,1) NOT NULL, -- E.g., 8.5
    summary TEXT NOT NULL,
    career_suggestions TEXT,
    learning_recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- 5. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
    summary TEXT NOT NULL,
    missing_skills TEXT, -- Stored as JSON string
    strengths TEXT, -- Stored as JSON string
    improvements TEXT, -- Stored as JSON string
    suggested_roles TEXT, -- Stored as JSON string
    suggested_questions TEXT, -- Stored as JSON string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);

-- 6. Interview Scores Table
CREATE TABLE IF NOT EXISTS interview_scores (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL,
    subject VARCHAR(255) NOT NULL, -- Python, DBMS, OOP, Operating System, Computer Networks, HR
    score INTEGER CHECK (score >= 0 AND score <= 10),
    max_score INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scores_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scores_interview ON interview_scores(interview_id);

-- 7. Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    subject VARCHAR(255) NOT NULL, -- Python, DBMS, OOP, Operating System, Computer Networks, HR
    average_score NUMERIC(4,2) DEFAULT 0.00,
    total_interviews INTEGER DEFAULT 0,
    last_tested TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id);
