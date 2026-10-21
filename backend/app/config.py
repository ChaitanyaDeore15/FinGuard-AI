import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinGuard AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Database: SQLite fallback for local dev, PostgreSQL for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finguard.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "finguard-ai-super-secret-educational-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
