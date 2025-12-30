# ============================================================================
# MAIN.PY - Simplified & Production Ready
# ============================================================================
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import APP_NAME, APP_VERSION, CORS_ALLOW_ORIGINS, ENV
from core.database import init_db, engine
from routes import init_routes
#from parser import JDParser
from models import User, Job
from datetime import datetime

# Initialize parser
#parser = JDParser(use_llm=os.getenv("USE_LLM", "false").lower() == "true")

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """App startup and shutdown"""
    init_db()
    print("✓ App started")
    yield
    print("✓ App shutting down")

# Create app
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*",]
)

# Include all routes
app.include_router(init_routes())


# Health check
@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
def root():
    return {
        "message": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }

# Run
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=ENV != "prod"
    )