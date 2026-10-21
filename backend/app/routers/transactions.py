import csv
import io
import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, case

from app.database import get_db
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.fraud import FraudPrediction, FraudReview, ReviewStatus
from app.models.user import User
from app.schemas.transaction import (
    TransactionResponse, TransactionListResponse, TransactionKPIs,
    CategorySpending, DailyTrend, MerchantSpending
)
from app.services.csv_validator import validate_and_parse_csv
from app.services.audit_service import log_audit_event
from app.ml.inference import MLInferenceEngine
from app.routers.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transaction Analytics"])

@router.get("", response_model=TransactionListResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by reference, account, or merchant"),
    category: Optional[str] = None,
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = Query(None, description="LOW, MEDIUM, HIGH, FLAGGED"),
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: str = Query("timestamp", regex="^(timestamp|amount|merchant_name|risk_score)$"),
    sort_dir: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).outerjoin(FraudPrediction)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Transaction.transaction_reference.ilike(search_filter)) |
            (Transaction.account_id.ilike(search_filter)) |
            (Transaction.merchant_name.ilike(search_filter))
        )

    if category and category != "ALL":
        query = query.filter(Transaction.merchant_category == category)

    if transaction_type and transaction_type != "ALL":
        query = query.filter(Transaction.transaction_type == transaction_type)

    if status and status != "ALL":
        query = query.filter(Transaction.status == status)

    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)

    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    if start_date:
        try:
            dt_start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Transaction.timestamp >= dt_start)
        except ValueError:
            pass

    if end_date:
        try:
            dt_end = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Transaction.timestamp <= dt_end)
        except ValueError:
            pass

    if risk_level:
        if risk_level == "FLAGGED":
            query = query.filter(FraudPrediction.is_flagged == True)
        elif risk_level == "HIGH":
            query = query.filter(FraudPrediction.risk_score >= 0.70)
        elif risk_level == "MEDIUM":
            query = query.filter(FraudPrediction.risk_score >= 0.30, FraudPrediction.risk_score < 0.70)
        elif risk_level == "LOW":
            query = query.filter(FraudPrediction.risk_score < 0.30)

    total = query.count()

    # Sorting
    sort_col = getattr(Transaction, sort_by) if hasattr(Transaction, sort_by) else FraudPrediction.risk_score
    if sort_dir.lower() == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    # Map items to include fraud score
    res_items = []
    for t in items:
        resp_dict = {
            "id": t.id,
            "transaction_reference": t.transaction_reference,
            "account_id": t.account_id,
            "amount": t.amount,
            "currency": t.currency,
            "merchant_name": t.merchant_name,
            "merchant_category": t.merchant_category,
            "transaction_type": t.transaction_type,
            "channel": t.channel,
            "status": t.status,
            "country_code": t.country_code,
            "is_international": t.is_international,
            "timestamp": t.timestamp,
            "created_at": t.created_at,
            "fraud_risk_score": t.fraud_prediction.risk_score if t.fraud_prediction else None,
            "is_flagged": t.fraud_prediction.is_flagged if t.fraud_prediction else False
        }
        res_items.append(TransactionResponse(**resp_dict))

    total_pages = max(1, (total + page_size - 1) // page_size)
    return {
        "items": res_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/analytics/kpis", response_model=TransactionKPIs)
def get_transaction_kpis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if start_date:
        try: query = query.filter(Transaction.timestamp >= datetime.strptime(start_date, "%Y-%m-%d"))
        except ValueError: pass
    if end_date:
        try: query = query.filter(Transaction.timestamp <= datetime.strptime(end_date, "%Y-%m-%d"))
        except ValueError: pass

    total_count = query.count()
    if total_count == 0:
        return {
            "total_volume": 0.0,
            "total_count": 0,
            "avg_transaction_value": 0.0,
            "flagged_count": 0,
            "flagged_volume": 0.0,
            "flagged_rate_pct": 0.0
        }

    total_vol = query.with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    avg_val = total_vol / total_count if total_count > 0 else 0.0

    flagged_q = query.filter(Transaction.status == TransactionStatus.FLAGGED)
    flagged_cnt = flagged_q.count()
    flagged_vol = flagged_q.with_entities(func.sum(Transaction.amount)).scalar() or 0.0
    flagged_pct = (flagged_cnt / total_count * 100.0) if total_count > 0 else 0.0

    return {
        "total_volume": round(float(total_vol), 2),
        "total_count": total_count,
        "avg_transaction_value": round(float(avg_val), 2),
        "flagged_count": flagged_cnt,
        "flagged_volume": round(float(flagged_vol), 2),
        "flagged_rate_pct": round(float(flagged_pct), 2)
    }

@router.get("/analytics/categories", response_model=List[CategorySpending])
def get_category_spending(db: Session = Depends(get_db)):
    results = db.query(
        Transaction.merchant_category,
        func.sum(Transaction.amount).label("total_amt"),
        func.count(Transaction.id).label("count")
    ).group_by(Transaction.merchant_category).order_by(desc("total_amt")).all()

    overall_vol = sum(r[1] for r in results) or 1.0
    categories = []
    for cat, amt, cnt in results:
        amt = float(amt or 0.0)
        categories.append({
            "category": cat,
            "amount": round(amt, 2),
            "count": cnt,
            "percentage": round((amt / overall_vol) * 100.0, 1)
        })
    return categories

@router.get("/analytics/trends", response_model=List[DailyTrend])
def get_daily_trends(days: int = Query(30, ge=7, le=90), db: Session = Depends(get_db)):
    # Group by date
    results = db.query(
        func.date(Transaction.timestamp).label("day"),
        func.sum(Transaction.amount).label("vol"),
        func.count(Transaction.id).label("cnt"),
        func.sum(case((Transaction.status == TransactionStatus.FLAGGED, 1), else_=0)).label("flagged")
    ).group_by("day").order_by(asc("day")).all()

    trends = []
    for r in results[-days:]:
        trends.append({
            "date": str(r[0]),
            "volume": round(float(r[1] or 0.0), 2),
            "count": int(r[2] or 0),
            "flagged_count": int(r[3] or 0)
        })
    return trends

@router.get("/analytics/merchants", response_model=List[MerchantSpending])
def get_top_merchants(limit: int = Query(10, ge=5, le=30), db: Session = Depends(get_db)):
    results = db.query(
        Transaction.merchant_name,
        Transaction.merchant_category,
        func.sum(Transaction.amount).label("total_amt"),
        func.count(Transaction.id).label("count")
    ).group_by(Transaction.merchant_name, Transaction.merchant_category).order_by(desc("total_amt")).limit(limit).all()

    return [
        {
            "merchant_name": r[0],
            "merchant_category": r[1],
            "total_amount": round(float(r[2] or 0.0), 2),
            "transaction_count": r[3]
        }
        for r in results
    ]

@router.get("/{id}")
def get_transaction_detail(id: int, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    pred = txn.fraud_prediction
    risk_factors = []
    if pred and pred.top_risk_factors:
        try:
            risk_factors = json.loads(pred.top_risk_factors)
        except Exception:
            pass

    review = db.query(FraudReview).filter(FraudReview.transaction_id == txn.id).first()

    return {
        "id": txn.id,
        "transaction_reference": txn.transaction_reference,
        "account_id": txn.account_id,
        "amount": txn.amount,
        "currency": txn.currency,
        "timestamp": txn.timestamp,
        "merchant_name": txn.merchant_name,
        "merchant_category": txn.merchant_category,
        "transaction_type": txn.transaction_type,
        "channel": txn.channel,
        "status": txn.status,
        "country_code": txn.country_code,
        "is_international": txn.is_international,
        "device_fingerprint": txn.device_fingerprint,
        "fraud_score": {
            "risk_score": pred.risk_score if pred else 0.0,
            "is_flagged": pred.is_flagged if pred else False,
            "threshold_used": pred.threshold_used if pred else 0.5,
            "model_version": pred.model_version if pred else "N/A",
            "risk_factors": risk_factors
        } if pred else None,
        "review": {
            "review_id": review.id,
            "review_status": review.review_status,
            "analyst_notes": review.analyst_notes,
            "action_taken": review.action_taken,
            "updated_at": review.updated_at
        } if review else None
    }

@router.post("/import-csv")
async def import_csv_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported for transaction ingestion.")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024: # 10MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed upload size (10MB).")

    # Fetch existing transaction references to detect duplicates
    existing_refs = set(r[0] for r in db.query(Transaction.transaction_reference).all())
    valid_rows, errors = validate_and_parse_csv(content, existing_refs)

    if not valid_rows and errors:
        return {
            "success": False,
            "message": "CSV ingestion failed validation. No transactions were imported.",
            "imported_count": 0,
            "rejected_count": len(errors),
            "errors": errors[:50]
        }

    ml_engine = MLInferenceEngine.get_instance()
    new_txns = []
    flagged_count = 0

    for r in valid_rows:
        txn = Transaction(
            transaction_reference=r['transaction_reference'],
            account_id=r['account_id'],
            amount=r['amount'],
            currency=r['currency'],
            timestamp=r['timestamp'],
            merchant_name=r['merchant_name'],
            merchant_category=r['merchant_category'],
            transaction_type=r['transaction_type'],
            channel=r['channel'],
            status=TransactionStatus.COMPLETED,
            country_code=r['country_code'],
            is_international=r['is_international']
        )
        db.add(txn)
        new_txns.append((txn, r))

    db.commit()

    # Now score all imported transactions
    for txn, r in new_txns:
        score_res = ml_engine.score_fraud_transaction({
            'amount': r['amount'],
            'hour': r['timestamp'].hour,
            'velocity_1h': 1,
            'amount_to_avg_ratio': 1.0,
            'ip_risk_score': 0.1,
            'is_international': r['is_international'],
            'merchant_category': r['merchant_category'],
            'transaction_type': r['transaction_type'].value
        })

        pred = FraudPrediction(
            transaction_id=txn.id,
            risk_score=score_res['risk_score'],
            is_flagged=score_res['is_flagged'],
            threshold_used=score_res['threshold_used'],
            predicted_label=score_res['predicted_label'],
            model_version=score_res['model_version'],
            top_risk_factors=json.dumps(score_res['risk_factors']),
            created_at=txn.timestamp
        )
        db.add(pred)

        if score_res['is_flagged']:
            flagged_count += 1
            txn.status = TransactionStatus.FLAGGED
            review = FraudReview(
                transaction_id=txn.id,
                review_status=ReviewStatus.PENDING,
                analyst_notes="Flagged during bulk CSV transaction ingestion batch.",
                created_at=txn.timestamp
            )
            db.add(review)

    db.commit()

    log_audit_event(
        db=db,
        action="IMPORT_TRANSACTIONS_CSV",
        resource_type="TRANSACTION_IMPORT",
        resource_id=file.filename,
        user_id=current_user.id,
        user_email=current_user.email,
        details=f"Imported {len(valid_rows)} transactions from '{file.filename}'. Flagged {flagged_count} suspicious records. Rejected {len(errors)} records."
    )

    return {
        "success": True,
        "message": f"Successfully ingested {len(valid_rows)} transactions ({flagged_count} flagged suspicious).",
        "imported_count": len(valid_rows),
        "rejected_count": len(errors),
        "flagged_count": flagged_count,
        "errors": errors[:30]
    }

@router.get("/export/csv")
def export_transactions_csv(
    category: Optional[str] = None,
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).outerjoin(FraudPrediction).order_by(desc(Transaction.timestamp))
    if category and category != "ALL": query = query.filter(Transaction.merchant_category == category)
    if transaction_type and transaction_type != "ALL": query = query.filter(Transaction.transaction_type == transaction_type)
    if status and status != "ALL": query = query.filter(Transaction.status == status)
    if start_date:
        try: query = query.filter(Transaction.timestamp >= datetime.strptime(start_date, "%Y-%m-%d"))
        except ValueError: pass
    if end_date:
        try: query = query.filter(Transaction.timestamp <= datetime.strptime(end_date, "%Y-%m-%d"))
        except ValueError: pass

    records = query.limit(5000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "transaction_reference", "account_id", "timestamp", "amount", "currency",
        "merchant_name", "merchant_category", "transaction_type", "channel",
        "status", "country_code", "is_international", "fraud_risk_score", "is_flagged"
    ])

    for t in records:
        writer.writerow([
            t.transaction_reference,
            t.account_id,
            t.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            f"{t.amount:.2f}",
            t.currency,
            t.merchant_name,
            t.merchant_category,
            t.transaction_type.value,
            t.channel,
            t.status.value,
            t.country_code,
            t.is_international,
            f"{t.fraud_prediction.risk_score:.4f}" if t.fraud_prediction else "",
            t.fraud_prediction.is_flagged if t.fraud_prediction else ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=finguard_transactions_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"}
    )
