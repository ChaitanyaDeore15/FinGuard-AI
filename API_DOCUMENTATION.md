# FinGuard AI — REST API Documentation & Endpoint Specification

FinGuard AI provides a RESTful API with automated OpenAPI / Swagger documentation (`/docs`) and ReDoc (`/redoc`).

Base Prefix: `/api/v1`

---

## 1. System Health & Diagnostics

### `GET /health`
Returns the operational health of the application, database connectivity, and ML model availability.

**Response (200 OK):**
```json
{
  "status": "online",
  "service": "FinGuard AI",
  "version": "1.0.0",
  "database": "healthy",
  "ml_engines": {
    "fraud_detection_engine": "ready",
    "credit_risk_engine": "ready"
  }
}
```

---

## 2. Authentication & Access Control

### `POST /api/v1/auth/login`
Authenticates a banking staff member and issues a stateless JSON Web Token (JWT).

**Request Body:**
```json
{
  "email": "analyst@finguard.ai",
  "password": "AnalystPassword123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "role": "RISK_ANALYST",
  "username": "analyst",
  "full_name": "Marcus Vance (Senior Fraud Analyst)"
}
```

### `GET /api/v1/auth/me`
Retrieves current user identity and permissions. Requires `Authorization: Bearer <token>` header.

---

## 3. Transaction Analytics (Module A)

### `GET /api/v1/transactions`
Retrieves a paginated list of transactions with multi-dimensional filtering, searching, and sorting.

**Query Parameters:**
- `page`: int (default: 1)
- `page_size`: int (default: 25, max: 100)
- `search`: string (matches `transaction_reference`, `account_id`, `merchant_name`)
- `category`: string (e.g., `Groceries`, `Electronics`, `Travel`)
- `transaction_type`: string (`POS`, `ONLINE`, `ATM_WITHDRAWAL`, `WIRE_TRANSFER`, `MOBILE_PAYMENT`)
- `status`: string (`COMPLETED`, `FLAGGED`, `DECLINED`)
- `risk_level`: string (`LOW`, `MEDIUM`, `HIGH`, `FLAGGED`)
- `min_amount` / `max_amount`: float
- `start_date` / `end_date`: ISO date (`YYYY-MM-DD`)
- `sort_by`: string (`timestamp`, `amount`, `merchant_name`, `risk_score`)
- `sort_dir`: string (`asc`, `desc`)

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 102,
      "transaction_reference": "TXN-2610-100102",
      "account_id": "ACC-1014",
      "amount": 1850.00,
      "currency": "USD",
      "merchant_name": "Apple Store Fifth Ave",
      "merchant_category": "Electronics",
      "transaction_type": "ONLINE",
      "channel": "WEB",
      "status": "FLAGGED",
      "country_code": "US",
      "is_international": false,
      "timestamp": "2026-10-18T03:15:00",
      "fraud_risk_score": 0.9998,
      "is_flagged": true
    }
  ],
  "total": 1250,
  "page": 1,
  "page_size": 25,
  "total_pages": 50
}
```

### `GET /api/v1/transactions/analytics/kpis`
Calculates total ledger volume, count, average transaction value, flagged volume, and fraud rate percentage directly from relational database records.

### `GET /api/v1/transactions/analytics/categories`
Returns volume and transaction count grouped by merchant category.

### `GET /api/v1/transactions/analytics/trends?days=30`
Returns daily timeline of settlement volume, transaction count, and flagged counts over the last 30 days.

### `POST /api/v1/transactions/import-csv`
Uploads a CSV transaction file, validates schema and column types, detects duplicates, executes ML fraud scoring on imported rows, and records an audit log.

**Form Data:**
- `file`: CSV file (multipart/form-data)

**Validation Response (Success):**
```json
{
  "success": true,
  "message": "Successfully ingested 25 transactions (2 flagged suspicious).",
  "imported_count": 25,
  "rejected_count": 0,
  "flagged_count": 2,
  "errors": []
}
```

**Validation Response (Rejection on malformed input):**
```json
{
  "success": false,
  "message": "CSV ingestion failed validation. No transactions were imported.",
  "imported_count": 0,
  "rejected_count": 1,
  "errors": [
    { "row": 2, "error": "Amount must be strictly positive (got -50.00)" }
  ]
}
```

### `GET /api/v1/transactions/export/csv`
Streams a dynamically generated CSV export of transactions matching the specified filter criteria.

---

## 4. AI Fraud Detection (Module B)

### `POST /api/v1/fraud/score`
Performs real-time fraud scoring for an individual transaction payload.

**Request Body:**
```json
{
  "amount": 2500.00,
  "hour": 3,
  "velocity_1h": 4,
  "amount_to_avg_ratio": 5.2,
  "ip_risk_score": 0.88,
  "is_international": true,
  "merchant_category": "Electronics",
  "transaction_type": "ONLINE"
}
```

**Response (200 OK):**
```json
{
  "risk_score": 0.9999,
  "is_flagged": true,
  "threshold_used": 0.65,
  "predicted_label": 1,
  "model_version": "finguard-xgb-v1.0",
  "risk_factors": [
    {
      "factor": "Transaction Spike",
      "impact": "HIGH_POSITIVE",
      "contribution": 0.336,
      "description": "Transaction amount is 5.2x higher than customer's historical 30-day baseline."
    },
    {
      "factor": "Rapid Velocity Cluster",
      "impact": "HIGH_POSITIVE",
      "contribution": 0.22,
      "description": "4 transactions initiated across the last 60 minutes."
    },
    {
      "factor": "Network / Proxy Anomaly",
      "impact": "HIGH_POSITIVE",
      "contribution": 0.22,
      "description": "Originating connection flagged with elevated proxy/VPN risk score (0.88)."
    }
  ]
}
```

### `GET /api/v1/fraud/alerts`
Retrieves suspicious transactions requiring compliance review. Supports `status_filter` (`ALL`, `PENDING`, `CONFIRMED_FRAUD`, `FALSE_POSITIVE`, `CLEARED`).

### `PATCH /api/v1/fraud/reviews/{review_id}`
Updates the investigation status and justification notes for a flagged transaction ticket.

**Request Body:**
```json
{
  "review_status": "CONFIRMED_FRAUD",
  "analyst_notes": "Cardholder confirmed unauthorized charge. Initiated card replacement and network chargeback.",
  "action_taken": "ACCOUNT_FREEZE"
}
```

### `GET /api/v1/fraud/distribution`
Returns histogram deciles of fraud risk score distribution across the transaction ledger.

---

## 5. Credit-Risk Assessment (Module C)

### `POST /api/v1/credit/assess`
Evaluates credit default probability and generates feature attribution waterfalls.

**Request Body:**
```json
{
  "applicant_name": "Marcus Vance",
  "credit_limit": 60000,
  "age": 32,
  "education_level": "University",
  "marital_status": "Married",
  "repayment_status_recent": 0,
  "avg_bill_amount": 18000,
  "avg_payment_amount": 9000
}
```

**Response (200 OK):**
```json
{
  "probability_of_default": 0.0842,
  "risk_tier": "LOW",
  "credit_score_equivalent": 812,
  "model_version": "credit-risk-xgb-v1.0",
  "key_risk_drivers": [
    {
      "factor": "Robust Payment-to-Balance Ratio",
      "impact": "LOW_RISK",
      "contribution": -0.15,
      "description": "Applicant settles 50.0% of statement balance monthly."
    },
    {
      "factor": "Conservative Utilization",
      "impact": "LOW_RISK",
      "contribution": -0.09,
      "description": "Healthy utilization buffer at only 30.0% of authorized limit."
    }
  ]
}
```

### `GET /api/v1/credit/assessments`
Retrieves past credit risk assessments.

### `GET /api/v1/credit/portfolio-summary`
Returns tier distribution (`LOW`, `MEDIUM`, `HIGH`) and average default probabilities.

---

## 6. Model Lab & Governance (Module E)

### `GET /api/v1/models`
Returns registered production models, training datasets, held-out test evaluation scores (Precision, Recall, F1, ROC-AUC, PR-AUC), confusion matrices, and feature importances.

### `GET /api/v1/models/evaluation-details`
Returns evaluation files, including downsampled precision-recall curves and ROC curves.

---

## 7. Audit Trail & Compliance

### `GET /api/v1/audit/logs`
Returns the regulatory audit trail. Supports filtering by `action`.
