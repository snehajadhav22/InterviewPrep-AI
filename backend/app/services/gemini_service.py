import json
import logging
import random
from typing import Dict, Any, List
import google.generativeai as genai
from backend.app.core.config import settings

logger = logging.getLogger("uvicorn.error")

# Configure Gemini API
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    logger.info("Gemini API key configured successfully.")
else:
    logger.warning("No Gemini API key found. Running in MOCK mode.")

class GeminiService:
    @staticmethod
    def _call_gemini(prompt: str, response_mime_type: str = "application/json") -> str:
        """Helper to invoke Gemini API with fallback to mock on empty API key or failures."""
        if not settings.GEMINI_API_KEY:
            raise ValueError("API Key not configured")
        
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            config = {"response_mime_type": response_mime_type} if response_mime_type == "application/json" else {}
            response = model.generate_content(prompt, generation_config=config)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API Error: {str(e)}")
            raise e

    @classmethod
    def generate_question(cls, job_role: str, experience_level: str, interview_type: str, previous_questions: List[str]) -> Dict[str, str]:
        """Generates a question based on role, experience, and interview type."""
        prompt = f"""
        You are an expert interviewer. Generate a single professional interview question for:
        - Job Role: {job_role}
        - Experience Level: {experience_level}
        - Interview Type: {interview_type} (HR, Technical, or Mixed)
        
        Avoid these previous questions: {previous_questions}
        
        Identify the subject category of this question. The subject must be exactly one of: "Python", "DBMS", "OOP", "Operating System", "Computer Networks", "HR".
        
        Return ONLY a JSON object:
        {{
            "question": "The question text",
            "subject": "One of the 6 subjects listed above"
        }}
        """
        
        try:
            res_text = cls._call_gemini(prompt)
            # Clean possible markdown block wrapping
            if res_text.startswith("```"):
                res_text = res_text.strip("`").replace("json\n", "").strip()
            data = json.loads(res_text)
            return {
                "question": data.get("question"),
                "subject": data.get("subject", "HR" if interview_type == "HR" else "Python")
            }
        except Exception:
            # Fallback mock question generation
            return cls._get_mock_question(job_role, experience_level, interview_type, previous_questions)

    @classmethod
    def evaluate_answer(cls, question: str, user_answer: str, job_role: str, subject: str) -> Dict[str, Any]:
        """Evaluates the user's answer and returns scoring/feedback."""
        prompt = f"""
        You are an expert interviewer evaluating a candidate's response.
        
        - Job Role: {job_role}
        - Subject Category: {subject}
        - Question: "{question}"
        - Candidate Answer: "{user_answer}"
        
        Evaluate the response. Score the answer out of 10. Give detailed feedback.
        
        Return ONLY a JSON object:
        {{
            "score": 8, // Integer 0 to 10
            "strengths": "Provide specific strengths of their response",
            "weaknesses": "Provide areas they missed or explained poorly",
            "better_answer": "Provide a model answer that would receive a 10/10 score",
            "suggestions": "Suggestions on how they can improve their score"
        }}
        """
        
        try:
            res_text = cls._call_gemini(prompt)
            if res_text.startswith("```"):
                res_text = res_text.strip("`").replace("json\n", "").strip()
            data = json.loads(res_text)
            return {
                "score": int(data.get("score", 7)),
                "strengths": data.get("strengths", "Clear communication."),
                "weaknesses": data.get("weaknesses", "Could use more technical depth."),
                "better_answer": data.get("better_answer", "A more structured and detailed response."),
                "suggestions": data.get("suggestions", "Try using the STAR method for answers.")
            }
        except Exception:
            return cls._get_mock_evaluation(question, user_answer, subject)

    @classmethod
    def generate_report(cls, questions_and_answers: List[Dict[str, Any]], job_role: str) -> Dict[str, str]:
        """Generates a summary report of the interview."""
        qa_summary = "\n".join([f"Q: {qa['question']}\nA: {qa['answer']}\nScore: {qa['score']}/10\n" for qa in questions_and_answers])
        prompt = f"""
        Synthesize the performance of a candidate who completed a mock interview for the role of {job_role}.
        
        Here is the QA transcript and scores:
        {qa_summary}
        
        Generate a comprehensive interview performance report.
        Return ONLY a JSON object:
        {{
            "summary": "Overall assessment summary of their performance.",
            "career_suggestions": "Recommended career paths, focus areas, or advice based on their current strengths and weaknesses.",
            "learning_recommendations": "Specific topics, skills, coding subjects, or interview techniques they need to study next."
        }}
        """
        try:
            res_text = cls._call_gemini(prompt)
            if res_text.startswith("```"):
                res_text = res_text.strip("`").replace("json\n", "").strip()
            data = json.loads(res_text)
            return {
                "summary": data.get("summary", "Well-rounded performance overall, demonstrating solid foundational knowledge."),
                "career_suggestions": data.get("career_suggestions", "Focus on technical roles matching your main skills. Build projects to show practical capability."),
                "learning_recommendations": data.get("learning_recommendations", "Review data structures, algorithms, and practice mock technical coding screens.")
            }
        except Exception:
            return {
                "summary": f"Completed mock interview for {job_role}. Demonstrated adequate knowledge of foundational subjects. Good overall response structure.",
                "career_suggestions": f"Consider specializing in Backend Engineering or core system components related to {job_role}. Continue working on system design principles.",
                "learning_recommendations": "Study database normalization, query optimizations, OOP principles (polymorphism vs inheritance), and multithreading basics."
            }

    @classmethod
    def analyze_resume(cls, text: str) -> Dict[str, Any]:
        """Analyzes resume text for ATS scoring and profile enhancement."""
        prompt = f"""
        Analyze the following resume text for ATS (Applicant Tracking System) compatibility, and provide career development insights.
        
        Resume Content:
        {text}
        
        Provide structured feedback in JSON format.
        Return ONLY a JSON object:
        {{
            "ats_score": 85, // Integer 0 to 100
            "summary": "A concise professional summary of the candidate's profile.",
            "missing_skills": ["Skill1", "Skill2", "Skill3"], // List of industry skills missing or weak in the resume
            "strengths": ["Strength1", "Strength2"], // Key strong aspects of their resume
            "improvements": ["Improvement1", "Improvement2"], // Actionable suggestions to improve the resume format/content
            "suggested_roles": ["Role1", "Role2"], // Fitting job roles for this candidate
            "suggested_questions": ["Q1", "Q2", "Q3"] // Custom interview questions based on their resume
        }}
        """
        try:
            res_text = cls._call_gemini(prompt)
            if res_text.startswith("```"):
                res_text = res_text.strip("`").replace("json\n", "").strip()
            data = json.loads(res_text)
            return {
                "ats_score": int(data.get("ats_score", 75)),
                "summary": data.get("summary", "Resume shows a competent profile in software fields."),
                "missing_skills": data.get("missing_skills", ["System Design", "Cloud Services (AWS/GCP)", "CI/CD Pipelines"]),
                "strengths": data.get("strengths", ["Solid academic credentials", "Hands-on projects with React/Python", "Good styling skills"]),
                "improvements": data.get("improvements", ["Quantify accomplishments with metrics", "Add bulleted key performance indicators", "List specific tool stacks"]),
                "suggested_roles": data.get("suggested_roles", ["Software Developer", "Frontend Developer", "Backend Developer"]),
                "suggested_questions": data.get("suggested_questions", [
                    "Can you explain the structure of the React project you built?",
                    "What database schema did you design for your project and how did you optimize queries?",
                    "How do you handle API security in web development?"
                ])
            }
        except Exception:
            # Fallback mock analysis
            return {
                "ats_score": 68,
                "summary": "The candidate has a promising resume with core technical skills, but lacks quantified metrics and clear layout hierarchy to score high on modern ATS scanners.",
                "missing_skills": ["Docker", "Kubernetes", "Redis", "Unit Testing", "System Architecture"],
                "strengths": ["Proficiency in Python/Javascript", "React development experience", "Active GitHub contribution indicators"],
                "improvements": [
                    "Include action verbs at the beginning of bullet points",
                    "Add numbers/percentages to describe impact (e.g. 'Improved efficiency by 20%')",
                    "Tailor target keywords to the job descriptions"
                ],
                "suggested_roles": ["Fullstack Engineer", "Frontend Developer", "Python Developer"],
                "suggested_questions": [
                    "Walk me through a difficult technical bug you solved in your projects.",
                    "What databases have you worked with, and how do you handle migrations?",
                    "How do you optimize React component rendering?"
                ]
            }

    # --- Private Helpers for Mocking ---

    @staticmethod
    def _get_mock_question(job_role: str, experience_level: str, interview_type: str, previous_questions: List[str]) -> Dict[str, str]:
        technical_questions = {
            "Software Developer": [
                {"question": "Explain the difference between a process and a thread, and how they share memory.", "subject": "Operating System"},
                {"question": "What is database normalization and what are the benefits of 3NF (Third Normal Form)?", "subject": "DBMS"},
                {"question": "Explain the concepts of Inheritance, Polymorphism, and Encapsulation in OOP.", "subject": "OOP"},
                {"question": "How does the TCP three-way handshake work when establishing a connection?", "subject": "Computer Networks"}
            ],
            "Python Developer": [
                {"question": "What is the difference between lists and tuples in Python, and when should you use each?", "subject": "Python"},
                {"question": "How does the Global Interpreter Lock (GIL) affect multi-threading in Python?", "subject": "Python"},
                {"question": "What are decorators in Python, and can you write a simple one?", "subject": "Python"},
                {"question": "Explain Python's memory management and garbage collection.", "subject": "Python"}
            ],
            "Frontend Developer": [
                {"question": "Explain React's Virtual DOM and how the reconciliation process works.", "subject": "OOP"},
                {"question": "What are cookies, local storage, and session storage, and how do they differ?", "subject": "Computer Networks"},
                {"question": "How do you optimize a website's performance and page loading speed?", "subject": "Computer Networks"},
                {"question": "Explain CSS box model, flexbox, and grid positioning systems.", "subject": "OOP"}
            ],
            "Backend Developer": [
                {"question": "What are RESTful APIs and what HTTP methods do they use?", "subject": "Computer Networks"},
                {"question": "What are indexes in a database, and how do they speed up queries? Are there downsides?", "subject": "DBMS"},
                {"question": "How do you secure a REST API (authentication, authorization, encryption)?", "subject": "Computer Networks"},
                {"question": "What is the difference between SQL and NoSQL databases?", "subject": "DBMS"}
            ],
            "Data Analyst": [
                {"question": "What is the difference between inner join, left join, and outer join in SQL?", "subject": "DBMS"},
                {"question": "What is data cleaning, and why is it important in analytics workflows?", "subject": "DBMS"},
                {"question": "Explain the difference between descriptive, predictive, and prescriptive analytics.", "subject": "HR"},
                {"question": "How do you handle missing values or outliers in a dataset?", "subject": "Python"}
            ],
            "AI Engineer": [
                {"question": "What is overfitting, and what techniques do you use to prevent it in deep learning?", "subject": "Python"},
                {"question": "Explain the difference between supervised, unsupervised, and reinforcement learning.", "subject": "OOP"},
                {"question": "What is the role of attention mechanism and transformers in generative AI?", "subject": "Python"},
                {"question": "How do you evaluate the performance of a classification model (Precision, Recall, F1)?", "subject": "DBMS"}
            ]
        }
        
        hr_questions = [
            {"question": "Tell me about yourself, your background, and why you are interested in this position.", "subject": "HR"},
            {"question": "Describe a time when you faced a conflict while working in a team. How did you resolve it?", "subject": "HR"},
            {"question": "What are your greatest strengths and weaknesses?", "subject": "HR"},
            {"question": "Where do you see yourself in 5 years?", "subject": "HR"},
            {"question": "How do you handle tight deadlines or stressful situations?", "subject": "HR"}
        ]
        
        choices = []
        if interview_type == "HR":
            choices = hr_questions
        else:
            role_pool = technical_questions.get(job_role, technical_questions["Software Developer"])
            if interview_type == "Mixed":
                choices = role_pool + hr_questions
            else:
                choices = role_pool

        # Filter out previous questions if possible
        filtered = [c for c in choices if c["question"] not in previous_questions]
        if not filtered:
            filtered = choices
            
        return random.choice(filtered)

    @staticmethod
    def _get_mock_evaluation(question: str, answer: str, subject: str) -> Dict[str, Any]:
        cleaned_ans = answer.strip()
        if not cleaned_ans:
            return {
                "score": 0,
                "strengths": "None observed.",
                "weaknesses": "No answer was provided.",
                "better_answer": "Provide a direct response explaining the concept.",
                "suggestions": "Be sure to answer each question clearly."
            }
        
        length = len(cleaned_ans)
        
        if length < 15:
            return {
                "score": 3,
                "strengths": "Attempted to answer.",
                "weaknesses": f"The answer is extremely brief ({length} chars). It lacks explanation, context, and details.",
                "better_answer": f"For a question on {subject}, you should introduce the concept, explain how it works, and give a specific example.",
                "suggestions": "Try writing at least 2-3 full sentences. Explain definitions and add technical details."
            }
        elif length < 60:
            return {
                "score": 6,
                "strengths": "Understands the core concept at a high level.",
                "weaknesses": "Answer is concise and lacks detail or examples.",
                "better_answer": f"A standard response for '{question}' would involve describing the mechanism, its advantages, disadvantages, and typical code/system use cases.",
                "suggestions": "Add an example or project scenario where you used this technology or faced this problem."
            }
        else:
            return {
                "score": 8,
                "strengths": "Good descriptive explanation with solid logic. Structured response.",
                "weaknesses": "Could be improved by discussing optimization, alternatives, or edge cases.",
                "better_answer": f"The ideal answer covers the definition, structural advantages (e.g. performance, flexibility), practical implementations, and compares it to alternatives.",
                "suggestions": "Discuss potential bottlenecks, tradeoffs, and how to handle errors or scale."
            }
