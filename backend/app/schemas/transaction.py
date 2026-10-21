from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.transaction import TransactionType, TransactionStatus

class TransactionBase(BaseModel):
    transaction_reference: str
    account_id: str
    amount: float = Field(..., gt=0)
    currency: str = "USD"
    merchant_name: str
    merchant_category: str
    transaction_type: TransactionType = TransactionType.ONLINE
    channel: str = "WEB"
    country_code: str = "US"
    is_international: bool = False

class TransactionCreate(TransactionBase):
    timestamp: Optional[datetime] = None

class TransactionResponse(TransactionBase):
    id: int
    timestamp: datetime
    status: TransactionStatus
    created_at: datetime
    fraud_risk_score: Optional[float] = None
    is_flagged: Optional[bool] = None

    class Config:
        from_attributes = True

class TransactionListResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class TransactionKPIs(BaseModel):
    total_volume: float
    total_count: int
    avg_transaction_value: float
    flagged_count: int
    flagged_volume: float
    flagged_rate_pct: float

class CategorySpending(BaseModel):
    category: str
    amount: float
    count: int
    percentage: float

class DailyTrend(BaseModel):
    date: str
    volume: float
    count: int
    flagged_count: int

class MerchantSpending(BaseModel):
    merchant_name: str
    merchant_category: str
    total_amount: float
    transaction_count: int
