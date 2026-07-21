import sys
import os
import logging

# Add parent directory to sys.path to resolve 'backend' imports when running from within the backend directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings
from backend.db import init_db
from backend.routes import (
    agencies,
    users,
    projects,
    videos,
    messages,
    notifications,
    storage,
    dashboard,
    team,
    invoices,
)

logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB and initialize Beanie ODM
    client = await init_db(settings.MONGODB_URI, settings.MONGODB_DB_NAME)

    if settings.RESEND_API_KEY:
        masked = settings.RESEND_API_KEY[:6] + "..." + settings.RESEND_API_KEY[-4:] if len(settings.RESEND_API_KEY) > 10 else "LOADED"
        logger.info(f"RESEND_API_KEY loaded: {masked}")
    else:
        logger.warning("RESEND_API_KEY is NOT configured in backend/.env")

    yield
    # Shutdown: Close database connection
    client.close()

app = FastAPI(
    title="FrameReview Multi-Tenant Backend",
    description="Production-ready multi-tenant FastAPI backend using Beanie ODM and Motor for MongoDB.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Group API routers under /api prefix
api_router = APIRouter(prefix="/api")
api_router.include_router(users.router)
api_router.include_router(agencies.router)
api_router.include_router(projects.router)
api_router.include_router(dashboard.router)
api_router.include_router(team.router)
api_router.include_router(invoices.router)
api_router.include_router(videos.router)
api_router.include_router(messages.router)
api_router.include_router(notifications.router)
api_router.include_router(storage.router)

app.include_router(api_router)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": settings.MONGODB_DB_NAME
    }
