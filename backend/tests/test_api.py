import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["database"] == "healthy"
    assert data["ml_engines"]["fraud_detection_engine"] == "ready"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "FinGuard AI" in response.json()["message"]

def test_auth_login_success():
    response = client.post("/api/v1/auth/login", json={
        "email": "analyst@finguard.ai",
        "password": "AnalystPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "RISK_ANALYST"

def test_auth_login_invalid_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "analyst@finguard.ai",
        "password": "WrongPassword999!"
    })
    assert response.status_code == 401

def test_transactions_list():
    response = client.get("/api/v1/transactions?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert data["total"] > 0

def test_transactions_kpis():
    response = client.get("/api/v1/transactions/analytics/kpis")
    assert response.status_code == 200
    data = response.json()
    assert data["total_volume"] > 0
    assert data["total_count"] > 0
    assert data["avg_transaction_value"] > 0

def test_transactions_categories():
    response = client.get("/api/v1/transactions/analytics/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "category" in data[0]

def test_transactions_filter_by_category():
    response = client.get("/api/v1/transactions?category=Groceries&page_size=5")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["merchant_category"] == "Groceries"

def test_fraud_score_single():
    payload = {
        "amount": 2500.00,
        "hour": 3,
        "velocity_1h": 4,
        "amount_to_avg_ratio": 5.2,
        "ip_risk_score": 0.88,
        "is_international": True,
        "merchant_category": "Electronics",
        "transaction_type": "ONLINE"
    }
    response = client.post("/api/v1/fraud/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["risk_score"] <= 1.0
    assert "risk_factors" in data
    assert len(data["risk_factors"]) > 0

def test_fraud_alerts():
    response = client.get("/api/v1/fraud/alerts?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "risk_score" in data[0]
        assert "review_status" in data[0]

def test_credit_assessment():
    payload = {
        "applicant_name": "Test Candidate",
        "credit_limit": 50000,
        "age": 32,
        "education_level": "University",
        "marital_status": "Single",
        "repayment_status_recent": 0,
        "avg_bill_amount": 12000,
        "avg_payment_amount": 6000
    }
    response = client.post("/api/v1/credit/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["probability_of_default"] <= 1.0
    assert data["risk_tier"] in ["LOW", "MEDIUM", "HIGH"]
    assert "key_risk_drivers" in data

def test_credit_portfolio_summary():
    response = client.get("/api/v1/credit/portfolio-summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_applicants" in data
    assert "tiers" in data

def test_models_registry():
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    domains = [m["target_domain"] for m in data]
    assert "FRAUD" in domains
    assert "CREDIT" in domains

def test_csv_upload_validation_malformed():
    # Empty CSV without headers
    malformed_csv = b"random,unstructured\n123,456"
    files = {"file": ("malformed.csv", malformed_csv, "text/csv")}
    response = client.post("/api/v1/transactions/import-csv", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert len(data["errors"]) > 0

def test_csv_upload_valid():
    import time
    ts = int(time.time())
    valid_csv = (
        "transaction_reference,account_id,amount,merchant_name,merchant_category,transaction_type,channel,country_code,is_international\n"
        f"TXN-TEST-{ts}-1,ACC-2099,145.50,Whole Foods Market,Groceries,POS,IN_STORE,US,False\n"
        f"TXN-TEST-{ts}-2,ACC-2099,2850.00,Binance US Exchange,Crypto/Gaming,ONLINE,WEB,US,True\n"
    ).encode("utf-8")
    files = {"file": ("test_transactions.csv", valid_csv, "text/csv")}
    response = client.post("/api/v1/transactions/import-csv", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["imported_count"] == 2
