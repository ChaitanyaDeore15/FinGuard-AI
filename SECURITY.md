# FinGuard AI — Security Architecture & Data Protection Policy

## 1. Scope & Disclaimer
FinGuard AI is an **educational technology prototype** created for academic evaluation and portfolio demonstration. It is not connected to live SWIFT/ACH payment rails, card payment processors, or credit rating bureaus. It must not be represented as a PCI-DSS certified payment switch or a production banking core.

---

## 2. Threat Modeling & Safeguards

| Threat Vector | Mitigation Strategy Implemented in FinGuard AI |
|---|---|
| **Credential Compromise** | Passwords hashed using industry-standard `bcrypt` with random salt (12 work factor rounds). Plaintext passwords are never persisted, cached, or logged. |
| **Session Hijacking** | Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`). Configurable token expiration (default 24 hours). |
| **Unauthorized Access (Privilege Escalation)** | Role-Based Access Control (RBAC) enforced via FastAPI dependency injection (`require_role`), separating `ADMIN`, `RISK_ANALYST`, and `COMPLIANCE_OFFICER`. |
| **Malicious File Ingestion** | CSV uploads are restricted to `.csv` extension, maximum file size capped at 10MB, and memory-streamed without executing shell commands or writing arbitrary files to disk. |
| **SQL Injection (SQLi)** | 100% parameterization via SQLAlchemy 2.0 ORM. Raw string concatenation is strictly avoided in database queries. |
| **Cross-Origin Resource Sharing (CORS)** | Development permits local origins (`http://localhost:5173`, `http://127.0.0.1:5173`). Production configuration binds explicit allowed origin domains via environment variables. |
| **Compliance Non-Repudiation** | Immutable audit trail in `audit_logs` tracking logins, CSV ingestion batches, fraud case triage changes, and underwriting decisions. |

---

## 3. Data Privacy & Synthetic Data Strategy
- No actual bank customer Personally Identifiable Information (PII) or Primary Account Numbers (PAN) are stored or processed.
- Synthetic account numbers follow the format `ACC-XXXX` and transaction references follow `TXN-YYYY-XXXXXX`.
- Demonstration seed data complies with ethical research principles and open dataset licenses (CC BY 4.0 / Open Data Commons).

---

## 4. Secret Management Best Practices
1. Never commit `.env` files, API keys, or JWT secret keys to version control.
2. The provided `.env.example` provides default development templates. In production environments, inject `SECRET_KEY` and `DATABASE_URL` via environment variables or secret vaults (e.g., AWS Secrets Manager, HashiCorp Vault).
