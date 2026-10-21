from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.database import Base, engine
from app.ml.inference import MLInferenceEngine
from app.routers import (
    health, auth, transactions, fraud, credit, dashboard, models, audit
)

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FinGuard AI — Enterprise Digital Banking Analytics, Real-time Fraud Detection, and Explainable Credit-Risk Intelligence Platform.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development prototype allow all; production uses settings.CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing the financial transaction request.",
            "detail": str(exc)
        }
    )

@app.on_event("startup")
async def startup_event():
    # Warm up ML models into memory
    print(">>> Initializing ML inference engine...")
    engine_instance = MLInferenceEngine.get_instance()
    print(">>> FinGuard AI backend services started successfully.")

# Mount routers
app.include_router(health.router)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(transactions.router, prefix=settings.API_PREFIX)
app.include_router(fraud.router, prefix=settings.API_PREFIX)
app.include_router(credit.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(models.router, prefix=settings.API_PREFIX)
app.include_router(audit.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "message": "Welcome to FinGuard AI Digital Banking & Risk Intelligence API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }
