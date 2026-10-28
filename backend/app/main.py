"""
InterviewIQ AI — FastAPI Main Application Entrypoint
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.interview import router as interview_router
from app.routes.reports import router as reports_router
from app.routes.resume import router as resume_router
from app.services.ml_service import MLService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("interviewiq")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: database initialization and model loading."""
    logger.info("Initializing InterviewIQ AI Database...")
    init_db()
    logger.info("Database initialized.")

    logger.info("Pre-warming ML models...")
    try:
        ml = MLService()
        logger.info(f"ML Service initialized. Models loaded: {ml.models_loaded}")
    except Exception as e:
        logger.warning(f"Error initializing ML Service on startup: {e}")

    yield

    logger.info("Shutting down InterviewIQ AI Backend...")


app = FastAPI(
    title="InterviewIQ AI API",
    description="Intelligent AI Interview Preparation Platform API with ML Scoring & Resume Analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(dashboard_router)
app.include_router(reports_router)


@app.get("/", tags=["Health"])
def root():
    """Root health check endpoint."""
    return {
        "status": "healthy",
        "service": "InterviewIQ AI API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Detailed health check including ML status."""
    ml = MLService()
    return {
        "status": "ok",
        "models_loaded": ml.models_loaded,
        "database": "connected",
    }

