# InterviewIQ AI 🧠🎯
### Intelligent AI Mock Interview & Career Preparation Platform

InterviewIQ AI is an end-to-end, production-grade EdTech and career development platform that bridges the gap between academic preparation and real-world hiring standards. The platform analyzes candidate resumes using custom-trained NLP models, conducts interactive role-specific mock interviews, and produces immediate, multi-dimensional feedback combining supervised ML scoring with large language models.

---

## 🌟 Key Features

1. **Smart Resume Analysis & Role Classification**:
   - Upload PDF or DOCX resumes.
   - Text extraction via PyMuPDF/PyPDF and python-docx.
   - Custom-trained TF-IDF + Logistic Regression model classifying target roles (Full Stack, Frontend, Backend, Data Science, DevOps, Mobile).
   - Domain-specific keyword extraction of technical competencies.

2. **Personalized Mock Interviews**:
   - Multiple interview tracks: **Technical**, **Behavioral (STAR Method)**, and **HR & Culture Fit**.
   - Questions dynamically generated based on target role, experience level, and optional custom job descriptions.
   - Fallback question bank ensuring 100% platform availability even without third-party API credentials.

3. **Hybrid AI Answer Evaluation**:
   - Custom-trained **Ridge Regression ($L_2$ regularized)** and **Multinomial Logistic Regression** model scoring candidate responses (0–100 scale) and qualitative grades (`poor`, `average`, `good`, `excellent`).
   - LLM synthesis for rich constructive feedback, key strengths, and actionable weaknesses.

4. **Interactive Candidate Dashboard**:
   - Tracks session history, performance streaks, average score improvements, and evaluated competencies.
   - Visual trend charts and recent interview logs.

5. **Personalized Learning Roadmap**:
   - Dynamic learning tracks that identify weak areas from past interviews and recommend structured study modules, system design primers, and algorithmic practice.

6. **Official Downloadable PDF Reports**:
   - One-click generated PDF interview evaluation reports with question-by-question scoring and coach commentary.

---

## 🏗️ Architecture & Project Structure

```text
interviewiq-ai/
├── backend/
│   ├── app/
│   │   ├── config.py              # Pydantic environment configuration
│   │   ├── database.py            # SQLAlchemy database engine & sessions
│   │   ├── main.py                # FastAPI app entrypoint, CORS & routers
│   │   ├── models.py              # SQLAlchemy ORM database models
│   │   ├── routes/
│   │   │   ├── auth.py            # Register, login, JWT token validation
│   │   │   ├── dashboard.py       # Performance stats & time-series data
│   │   │   ├── interview.py       # Session lifecycle, questions, scoring
│   │   │   ├── reports.py         # PDF report downloads
│   │   │   └── resume.py          # Resume upload & skill extraction
│   │   ├── schemas/               # Request & response Pydantic schemas
│   │   └── services/
│   │       ├── auth_service.py    # Native bcrypt hashing & JWT tokens
│   │       ├── interview_service.py # Flow management & score blending
│   │       ├── llm_service.py     # OpenAI client with offline fallbacks
│   │       ├── ml_service.py      # ML model loading & inference singleton
│   │       ├── report_service.py  # ReportLab PDF report generator
│   │       └── resume_service.py  # PDF/DOCX parsing & classification
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/page.tsx # Analytics & progress
│   │   │   ├── history/page.tsx   # Past interviews log & search
│   │   │   ├── interview/page.tsx # Setup new mock interview
│   │   │   ├── interview/[id]/page.tsx # Interactive interview room
│   │   │   ├── login/page.tsx     # Sign in page
│   │   │   ├── register/page.tsx  # Sign up page
│   │   │   ├── results/[id]/page.tsx # Comprehensive evaluation report
│   │   │   ├── resume/page.tsx    # Resume drag-and-drop & skills viewer
│   │   │   ├── roadmap/page.tsx   # Personalized study milestones
│   │   │   ├── layout.tsx         # Global fonts & AuthProvider
│   │   │   └── page.tsx           # High-converting landing page
│   │   ├── components/            # Reusable UI components & layouts
│   │   └── lib/                   # API client & AuthContext
│   ├── package.json
│   └── tailwind.config.ts
├── notebooks/
│   ├── 01_data_exploration.ipynb  # EDA on answers, resumes, and jobs
│   ├── 02_resume_analysis.ipynb   # Skill extraction & role classification
│   ├── 03_answer_scoring.ipynb    # Ridge regression & quality classifier
│   ├── 04_model_evaluation.ipynb  # Accuracy, F1, RMSE, R² & error plots
│   └── 05_model_inference.ipynb   # Unseen candidate test predictions
├── data/
│   ├── interview_answers.csv      # 504 labeled Q&A training pairs
│   ├── resume_skills.csv          # 405 candidate resumes & role labels
│   └── job_descriptions.csv       # 113 industry job specifications
├── models/
│   ├── skill_classifier.joblib    # Trained Logistic Regression classifier
│   ├── skill_vectorizer.joblib    # TF-IDF resume vocabulary
│   ├── skill_label_encoder.joblib # Role label encoder
│   ├── answer_scorer.joblib       # Trained Ridge regression scorer
│   ├── answer_vectorizer.joblib   # TF-IDF question+answer vocabulary
│   ├── answer_quality_classifier.joblib # Quality tier classifier
│   └── inference_pipeline.py      # Standalone reusable inference module
├── tests/
│   ├── test_api_endpoints.py      # FastAPI end-to-end integration tests
│   ├── test_auth.py               # Password hashing & JWT token tests
│   ├── test_interview.py          # Session & scoring tests
│   ├── test_ml_pipeline.py        # ML models accuracy & boundary tests
│   └── test_resume.py             # Resume parsing & skill detection tests
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 🔬 Machine Learning Pipeline & Metrics

Our custom ML pipeline was developed and validated in the `notebooks/` directory and exported to `models/`:

| Model Task | Algorithm | Features | Metrics |
|---|---|---|---|
| **Resume Role Classifier** | Multinomial Logistic Regression | Sublinear TF-IDF (1-2 ngrams, 2,500 features) | **100% Accuracy** on stratified test set |
| **Answer Score Regressor** | Ridge Regression ($L_2$ regularization) | TF-IDF on Question + Answer (3,000 features) | **$R^2 = 0.9086$**, **RMSE = 7.61** (0–100 scale) |
| **Answer Quality Classifier** | Logistic Regression | TF-IDF representation | **Weighted $F_1 = 1.000$** across all 4 tiers |

### Reproducing Model Training & Notebooks:
To launch and run the Jupyter notebooks in order:
```bash
jupyter notebook notebooks/
```
1. `01_data_exploration.ipynb`: Inspect data shapes, missing values, length distributions, and correlations.
2. `02_resume_analysis.ipynb`: Train resume classifier and extract skill dictionaries.
3. `03_answer_scoring.ipynb`: Engineer features and train Ridge regression scorer.
4. `04_model_evaluation.ipynb`: Plot residuals, cross-validation metrics, and confusion matrices.
5. `05_model_inference.ipynb`: Run live predictions on novel test profiles.

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install email-validator httpx "python-jose[cryptography]" passlib

# Copy environment variables
cp ../.env.example .env

# Run FastAPI backend
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at: `http://localhost:8000`  
Swagger API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend Web Application will be running at: `http://localhost:3000`

---

## 🧪 Running Automated Tests

Run the full pytest suite (ML models, auth, resume extraction, interview sessions, and FastAPI endpoints):
```bash
python -m pytest tests/ -v
```
All 17 tests will run and validate the full stack.

---

## 🌐 Production Deployment

### Backend (Render, Railway, or Google Cloud Run)
1. Set environment variables from `.env.example`:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g. Supabase or Neon).
   - `SECRET_KEY`: A secure random 64-character string.
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API key for enhanced question variety.
2. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Frontend (Vercel)
1. Connect your repository to Vercel.
2. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed FastAPI backend (e.g., `https://api.interviewiq.ai`).
3. Build command: `npm run build`
4. Output directory: Next.js default (`.next`).

