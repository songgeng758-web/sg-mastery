"""
SGMastery Backend API

FastAPI application with CORS configuration for frontend communication.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

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
        "http://localhost:5173",  # Vite default development server port
        "http://127.0.0.1:5173",  # Alternative localhost format
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Register API router
# Requirements: 9.1
app.include_router(router)


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
