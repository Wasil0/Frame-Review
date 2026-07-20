import sys
import os

# Add parent directory to sys.path to resolve 'backend' imports when running from within the backend directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from contextlib import asynccontextmanager
from fastapi import FastAPI
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
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB and initialize Beanie ODM
    client = await init_db(settings.MONGODB_URI, settings.MONGODB_DB_NAME)
    yield
    # Shutdown: Close database connection
    client.close()

app = FastAPI(
    title="FrameReview Multi-Tenant Backend",
    description="Production-ready, lightweight multi-tenant FastAPI backend using Beanie ODM and Motor for MongoDB.",
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

# Wire up routers
app.include_router(agencies.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(videos.router)
app.include_router(messages.router)
app.include_router(notifications.router)
app.include_router(storage.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": settings.MONGODB_DB_NAME
    }
