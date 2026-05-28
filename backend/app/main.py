"""
SGMastery Backend API

FastAPI application with CORS configuration for frontend communication.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.bug_hunt import bug_hunt_router
from app.api.hcm_practice import hcm_practice_router

# Create FastAPI application instance
app = FastAPI(
    title="SGMastery API",
    description="Backend API for SGMastery learning application",
    version="1.0.0"
)

# Configure CORS middleware to allow frontend cross-origin requests
# Requirements: 9.8, 12.7
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sg-mastery.vercel.app",
    ],
    allow_origin_regex=r"https://sg-mastery-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Register API routers
# Requirements: 9.1
app.include_router(router)
app.include_router(bug_hunt_router)
app.include_router(hcm_practice_router)


@app.get("/")
async def root():
    """
    Root endpoint for health check.
    
    Returns basic API status information.
    """
    return {
        "message": "SGMastery API is running",
        "status": "healthy",
        "version": "1.0.0"
    }
