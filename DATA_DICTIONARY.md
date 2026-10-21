# FinGuard AI — Data Dictionary & Feature Specification

This data dictionary documents every entity, column, constraint, data type, and valid enumeration value in the FinGuard AI relational database and machine learning feature spaces.

---

## 1. Relational Entities

### Table: `users`
| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | No | PK Auto | Unique user identifier |
| `email` | VARCHAR(255) | No | None | Unique corporate email address |
| `username` | VARCHAR(100) | No | None | Unique login handle |
| `full_name` | VARCHAR(255) | No | None | User's full institutional title |
| `hashed_password` | VARCHAR(255) | No | None | Bcrypt salted password hash (12 rounds) |
| `role` | VARCHAR(32) | No | 'RISK_ANALYST'| Enum: `ADMIN`, `RISK_ANALYST`, `COMPLIANCE_OFFICER` |
| `is_active` | BOOLEAN | No | True | Account active status |
| `created_at` | DATETIME | No | UTC Now | Record creation timestamp |
| `updated_at` | DATETIME | No | UTC Now | Record modification timestamp |

---

### Table: `transactions`
| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | No | PK Auto | Unique transaction identifier |
| `transaction_reference` | VARCHAR(64) | No | None | Unique reference code (e.g. `TXN-2610-100234`) |
| `account_id` | VARCHAR(64) | No | None | Customer account identifier (e.g. `ACC-1014`) |
| `amount` | FLOAT | No | None | Transaction settlement amount |
| `currency` | VARCHAR(3) | No | 'USD' | ISO-4217 currency code (`USD`, `EUR`, `GBP`) |
| `timestamp` | DATETIME | No | UTC Now | Transaction execution timestamp |
| `merchant_name` | VARCHAR(128) | No | None | Commercial entity or payee name |
| `merchant_category` | VARCHAR(64) | No | None | Spending sector category |
| `transaction_type` | VARCHAR(32) | No | 'ONLINE' | Enum: `POS`, `ONLINE`, `ATM_WITHDRAWAL`, `WIRE_TRANSFER`, `MOBILE_PAYMENT` |
| `channel` | VARCHAR(32) | No | 'WEB' | Ingestion channel (`WEB`, `MOBILE_APP`, `IN_STORE`, `API`) |
| `status` | VARCHAR(32) | No | 'COMPLETED'| Enum: `COMPLETED`, `PENDING`, `FLAGGED`, `DECLINED` |
| `country_code` | VARCHAR(3) | No | 'US' | ISO 3166-1 alpha-2 country of origin |
| `device_fingerprint` | VARCHAR(128) | Yes | None | Unique device tracking hash |
| `is_international` | BOOLEAN | No | False | True if merchant is foreign to issuing bank |
| `created_at` | DATETIME | No | UTC Now | Ingestion timestamp |

---

### Table: `fraud_predictions`
| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | No | PK Auto | Unique prediction identifier |
| `transaction_id` | INTEGER | No | FK | Reference to `transactions.id` (Unique, Cascade) |
| `risk_score` | FLOAT | No | None | ML posterior probability of fraud (0.0000 - 1.0000) |
| `is_flagged` | BOOLEAN | No | False | True if `risk_score >= threshold_used` |
| `threshold_used` | FLOAT | No | 0.65 | Operating decision threshold applied |
| `predicted_label` | INTEGER | No | 0 | Binary output: 0 (Legitimate), 1 (Fraud) |
| `model_version` | VARCHAR(64) | No | None | Active ML model version string |
| `top_risk_factors` | TEXT | Yes | None | JSON array of feature attribution drivers |
| `created_at` | DATETIME | No | UTC Now | Scoring timestamp |

---

### Table: `fraud_reviews`
| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | No | PK Auto | Case review ticket identifier |
| `transaction_id` | INTEGER | No | FK | Reference to `transactions.id` |
| `reviewer_id` | INTEGER | Yes | FK | Reference to `users.id` |
| `review_status` | VARCHAR(32) | No | 'PENDING' | Enum: `PENDING`, `CONFIRMED_FRAUD`, `FALSE_POSITIVE`, `CLEARED` |
| `analyst_notes` | TEXT | Yes | None | Investigation audit justification |
| `action_taken` | VARCHAR(128) | Yes | None | Operational action executed |
| `created_at` | DATETIME | No | UTC Now | Ticket creation timestamp |
| `updated_at` | DATETIME | No | UTC Now | Last triage decision timestamp |

---

### Table: `credit_assessments`
| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | No | PK Auto | Unique assessment identifier |
| `applicant_reference` | VARCHAR(64) | No | None | Unique applicant application tracking reference |
| `applicant_name` | VARCHAR(128) | No | None | Full legal applicant name |
| `credit_limit` | FLOAT | No | None | Requested / authorized credit line |
| `age` | INTEGER | No | None | Applicant age in years |
| `education_level` | VARCHAR(64) | No | None | Level: `Graduate School`, `University`, `High School`, `Other` |
| `marital_status` | VARCHAR(32) | No | None | Status: `Married`, `Single`, `Other` |
| `repayment_status_recent` | INTEGER | No | 0 | Delay status in most recent cycle (-1=punctual, 1=1mo delay, 2=2mo delay) |
| `utilization_ratio` | FLOAT | No | 0.0 | Ratio of average statement balance to credit limit |
| `probability_of_default` | FLOAT | No | None | Estimated default probability (0.0000 - 1.0000) |
| `risk_tier` | VARCHAR(32) | No | None | Enum: `LOW`, `MEDIUM`, `HIGH` |
| `key_risk_drivers` | TEXT | Yes | None | JSON array of feature contributions |
| `assessed_at` | DATETIME | No | UTC Now | Assessment timestamp |

---

### Table: `audit_logs`
| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INTEGER | No | PK Auto | Log record identifier |
| `user_id` | INTEGER | Yes | None | ID of actor executing action |
| `user_email` | VARCHAR(255) | Yes | None | Email of actor |
| `action` | VARCHAR(64) | No | None | Action identifier (e.g., `UPDATE_FRAUD_REVIEW`) |
| `resource_type` | VARCHAR(64) | No | None | Target entity (`TRANSACTION`, `FRAUD_REVIEW`) |
| `resource_id` | VARCHAR(64) | Yes | None | Target entity reference key |
| `details` | TEXT | Yes | None | Structured or textual description |
| `ip_address` | VARCHAR(45) | No | '127.0.0.1'| IPv4/IPv6 address of request |
| `timestamp` | DATETIME | No | UTC Now | Execution timestamp |
