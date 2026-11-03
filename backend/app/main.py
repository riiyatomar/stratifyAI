# ========================================
# STRATIFY AI — FastAPI Backend
# ========================================

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.routers.projects import router as projects_router
from app.routers.settings import router as settings_router

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stratify AI API",
    description="Backend API for the Stratify AI Client Lifecycle Automation System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow any frontend (localhost, Netlify, Vercel, GitHub Pages) to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(projects_router)
app.include_router(settings_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Stratify AI Backend",
        "version": "1.0.0",
    }


# Mount frontend static files if available in parent directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if (BASE_DIR / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(BASE_DIR), html=True), name="frontend")
