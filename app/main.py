"""
FastAPI main application entry point for Semantic Search Engine.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.gui import router as api_router

# Create FastAPI application
app = FastAPI(
    title="Semantic Search Engine",
    description="AI Research Assistant - University Project",
    version="1.0.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """
    Health check endpoint to verify API is running.
    """
    return {
        "status": "healthy",
        "message": "Semantic Search Engine API is running"
    }

# Include API router
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
