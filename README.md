# InterviewPrep AI 🚀

InterviewPrep AI is a production-quality, AI-powered interview preparation platform designed to help students, freshers, job seekers, and developers ace their interviews. The application integrates the **Gemini API** to evaluate user responses in real-time, score them, and analyze PDF resumes to calculate ATS match percentages.

---

## 🌟 Key Features

1. **Secure JWT Authentication**: Full registration, login, and forgot password flows. Handles user sessions securely.
2. **Interactive AI Mock Interviews**:
   - Technical, HR, and Mixed interview modes.
   - Tailored questions based on Job Role (Software Developer, Python Developer, Frontend Developer, Backend Developer, Data Analyst, AI Engineer) and Experience Level.
   - Question-by-question scoring (out of 10) with detailed strengths, weaknesses, suggested model answers, and improvements.
   - **Voice Interview Mode**: Speech-to-Text inputs and Text-to-Speech speaking using standard browser Web Speech APIs.
3. **Resume Analyzer**:
   - Drag & drop PDF resume upload.
   - Extracts text and scores ATS compliance.
   - Generates profile summaries, missing keywords highlights, suggested roles, and targeted interview questions.
4. **Professional Dashboard**: Summary metric cards (Total Interviews, Average Score, Best Category, Weakest Category) and recent activity logs.
5. **Detailed Analytics**: Interactive charts (Score progression, weekly progress, subject category averages, and score distributions) powered by Recharts.
6. **Admin Panel**: Platform statistics (Total registered users, global interview counts, system score averages) and user performance tracking grids.
7. **Certificate of Competency**: An interactive, print-ready certificate generated upon successful interview completion.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js (Vite)
  - Tailwind CSS (SaaS theme styling)
  - React Router DOM
  - Axios (with automated JWT headers injection)
  - Recharts (Interactive visualization charts)
  - Lucide React (Modern icon sets)
- **Backend**:
  - Python FastAPI (REST APIs, CORS configuration)
  - SQLAlchemy ORM (compatible with PostgreSQL & SQLite)
  - Pydantic v2 (Input validations and serialization schemas)
  - Uvicorn (Asynchronous server gateway interface)
  - Passlib & bcrypt (Secure credentials encryption)
  - PyPDF (PDF text extraction)
- **Database**:
  - PostgreSQL / SQLite (SQLite is utilized out-of-the-box for local setup)
- **AI**:
  - Google Gemini API (`google-generativeai`)

---

## 📁 Folder Structure

```text
InterviewPrep-AI/
├── backend/
│   ├── app/
│   │   ├── core/           # Database, configs, JWT helpers
│   │   ├── models/         # SQLAlchemy DB models
│   │   ├── schemas/        # Pydantic validation models
│   │   ├── routes/         # FastAPI endpoints (Auth, Dashboard, Resume, etc.)
│   │   ├── services/       # Gemini AI integrations
│   │   └── main.py         # Application root & CORS mount
│   ├── requirements.txt    # Python dependencies list
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, Sidebar, Certificate, Cards
│   │   ├── pages/          # Login, Register, Dashboard, Profile, etc.
│   │   ├── services/       # API Axios clients
│   │   ├── hooks/          # useAuth React context hook
│   │   ├── App.jsx         # Router configuration
│   │   ├── index.css       # Tailwind entry & custom glassmorphism
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Installation & Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Gemini API Key (optional; backend includes a realistic mock fallback mode if no key is configured)

---

### Step 1: Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Install the backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables. Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=sqlite:///./interview_prep.db
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   JWT_SECRET=supersecretkeychangeinproduction1234567890!
   ```

6. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will be running at `http://localhost:8000`. You can access the interactive API docs at `http://localhost:8000/docs`.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The frontend will boot at `http://localhost:5173`. Open this URL in your web browser.

---

## 🔮 Future Enhancements

- **Real-time Coding IDE**: An interactive coding editor inside technical mock screens to execute code.
- **Video Emotion Analytics**: Utilizing camera nodes to analyze candidate posture, confidence, and facial responses.
- **Multi-lingual AI voices**: Conversational support for practicing interviews in multiple languages.
- **Enterprise Team Dashboards**: Allowing recruitment teams and college departments to review cohort performance analytics.
