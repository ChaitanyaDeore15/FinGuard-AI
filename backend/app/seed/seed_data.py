"""
Database Seeding Script for FinGuard AI.
Populates realistic users, 1,200 transactions across the last 90 days,
fraud predictions, case reviews, credit risk assessments, and audit logs.
"""
import random
import json
from datetime import datetime, timedelta
import numpy as np

from app.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.fraud import FraudPrediction, FraudReview, ReviewStatus
from app.models.credit import CreditAssessment, RiskTier
from app.models.audit import AuditLog
from app.services.auth_service import get_password_hash
from app.ml.inference import MLInferenceEngine

def seed_database():
    db = SessionLocal()
    ml_engine = MLInferenceEngine.get_instance()

    print(">>> Seeding Users...")
    # Clean old records if any
    db.query(AuditLog).delete()
    db.query(FraudReview).delete()
    db.query(FraudPrediction).delete()
    db.query(Transaction).delete()
    db.query(CreditAssessment).delete()
    db.query(User).delete()
    db.commit()

    users = [
        User(
            email="admin@finguard.ai",
            username="admin",
            full_name="Sarah Chen (Chief Risk Officer)",
            hashed_password=get_password_hash("AdminPassword123!"),
            role=UserRole.ADMIN,
            is_active=True
        ),
        User(
            email="analyst@finguard.ai",
            username="analyst",
            full_name="Marcus Vance (Senior Fraud Analyst)",
            hashed_password=get_password_hash("AnalystPassword123!"),
            role=UserRole.RISK_ANALYST,
            is_active=True
        ),
        User(
            email="auditor@finguard.ai",
            username="auditor",
            full_name="Elena Rostova (Compliance Auditor)",
            hashed_password=get_password_hash("AuditorPassword123!"),
            role=UserRole.COMPLIANCE_OFFICER,
            is_active=True
        )
    ]
    db.add_all(users)
    db.commit()
    admin_user = users[0]
    analyst_user = users[1]

    print(">>> Seeding 1,250 realistic transactions and ML fraud scores...")
    merchants = {
        'Groceries': ['Whole Foods Market', 'Trader Joe\'s', 'Kroger Supermarket', 'Safeway', 'Costco Wholesale'],
        'Dining': ['Starbucks Coffee', 'Chipotle Mexican Grill', 'Sweetgreen', 'Shake Shack', 'The Capital Grille'],
        'Utilities': ['ConEdison Electric', 'AT&T Mobility', 'Verizon Wireless', 'National Grid Gas', 'AWS Cloud Services'],
        'Electronics': ['Apple Store Fifth Ave', 'Best Buy Electronics', 'B&H Photo Video', 'Newegg Computers', 'Micro Center'],
        'Travel': ['Delta Air Lines', 'United Airlines', 'Uber Technologies', 'Marriott International', 'Airbnb Stays'],
        'Healthcare': ['CVS Pharmacy', 'Walgreens Health', 'Quest Diagnostics', 'CityMD Urgent Care', 'Mayo Clinic'],
        'Entertainment': ['Netflix Streaming', 'Spotify Music', 'AMC Theatres', 'PlayStation Store', 'Ticketmaster'],
        'Crypto/Gaming': ['Binance US Exchange', 'Coinbase Inc', 'Steam Games Online', 'Kraken Crypto', 'Epic Games']
    }

    accounts = [f"ACC-{1000 + i}" for i in range(1, 45)]
    now = datetime.utcnow()
    transactions = []
    
    # We will generate 1,250 transactions with realistic date decay over last 90 days
    random.seed(42)
    np.random.seed(42)

    for i in range(1, 1251):
        account = random.choice(accounts)
        days_ago = random.expovariate(1.0 / 25.0) # More recent transactions
        days_ago = min(89.0, days_ago)
        hours_offset = random.randint(0, 23)
        minutes_offset = random.randint(0, 59)
        txn_time = now - timedelta(days=days_ago, hours=hours_offset, minutes=minutes_offset)

        # 2% chance of being an intentional high-risk synthetic anomaly
        is_synthetic_fraud = (random.random() < 0.022)

        if is_synthetic_fraud:
            category = random.choice(['Electronics', 'Crypto/Gaming', 'Travel'])
            merchant = random.choice(merchants[category])
            amount = round(random.choice([random.uniform(750, 4200), random.uniform(1.99, 8.50)]), 2)
            txn_type = random.choice([TransactionType.ONLINE, TransactionType.WIRE_TRANSFER])
            channel = "WEB" if txn_type == TransactionType.ONLINE else "API"
            is_intl = random.choice([True, False, True]) # 66% intl
            velocity = random.randint(3, 7)
            ratio = round(random.uniform(3.5, 9.0), 2)
            ip_risk = round(random.uniform(0.65, 0.98), 3)
            hour = txn_time.hour
        else:
            category = random.choice(list(merchants.keys()))
            merchant = random.choice(merchants[category])
            amount = round(float(np.random.lognormal(mean=3.6, sigma=0.9)), 2)
            amount = max(3.50, min(1450.0, amount))
            txn_type = random.choice([
                TransactionType.POS, TransactionType.ONLINE, TransactionType.MOBILE_PAYMENT,
                TransactionType.ATM_WITHDRAWAL, TransactionType.WIRE_TRANSFER
            ])
            channel = "IN_STORE" if txn_type == TransactionType.POS else ("MOBILE_APP" if txn_type == TransactionType.MOBILE_PAYMENT else "WEB")
            is_intl = (random.random() < 0.04)
            velocity = random.choice([1, 1, 1, 2])
            ratio = round(float(np.random.lognormal(0.0, 0.3)), 2)
            ip_risk = round(float(np.random.beta(1.2, 8.0)), 3)
            hour = txn_time.hour

        txn = Transaction(
            transaction_reference=f"TXN-{txn_time.strftime('%y%m')}-{100000 + i}",
            account_id=account,
            amount=amount,
            currency="USD" if not is_intl else random.choice(["USD", "EUR", "GBP"]),
            timestamp=txn_time,
            merchant_name=merchant,
            merchant_category=category,
            transaction_type=txn_type,
            channel=channel,
            status=TransactionStatus.COMPLETED,
            country_code="US" if not is_intl else random.choice(["GB", "DE", "SG", "FR", "JP"]),
            device_fingerprint=f"dev_fp_{random.randint(10000, 99999)}",
            is_international=is_intl,
            created_at=txn_time
        )
        db.add(txn)
        transactions.append((txn, {
            'amount': amount,
            'hour': hour,
            'velocity_1h': velocity,
            'amount_to_avg_ratio': ratio,
            'ip_risk_score': ip_risk,
            'is_international': is_intl,
            'merchant_category': category,
            'transaction_type': txn_type.value
        }))

    db.commit()

    print(">>> Scoring transactions and creating Fraud Review queue...")
    review_statuses = [ReviewStatus.PENDING, ReviewStatus.CONFIRMED_FRAUD, ReviewStatus.FALSE_POSITIVE, ReviewStatus.CLEARED]
    flagged_count = 0

    for txn, features in transactions:
        score_res = ml_engine.score_fraud_transaction(features)
        
        fraud_pred = FraudPrediction(
            transaction_id=txn.id,
            risk_score=score_res['risk_score'],
            is_flagged=score_res['is_flagged'],
            threshold_used=score_res['threshold_used'],
            predicted_label=score_res['predicted_label'],
            model_version=score_res['model_version'],
            top_risk_factors=json.dumps(score_res['risk_factors']),
            created_at=txn.timestamp
        )
        db.add(fraud_pred)

        if score_res['is_flagged']:
            flagged_count += 1
            txn.status = TransactionStatus.FLAGGED

            # Assign review workflow state
            rev_choice = random.choice([
                ReviewStatus.PENDING, ReviewStatus.PENDING,
                ReviewStatus.CONFIRMED_FRAUD, ReviewStatus.FALSE_POSITIVE, ReviewStatus.CLEARED
            ])
            notes = "Flagged automatically by high-risk XGBoost ensemble trigger."
            if rev_choice == ReviewStatus.CONFIRMED_FRAUD:
                notes = "Cardholder contacted; confirmed unauthorized fraudulent activity. Card cancelled."
            elif rev_choice == ReviewStatus.FALSE_POSITIVE:
                notes = "Cardholder verified international business travel. Whitelisted merchant."
            elif rev_choice == ReviewStatus.CLEARED:
                notes = "Two-factor SMS challenge passed successfully by user."

            review = FraudReview(
                transaction_id=txn.id,
                reviewer_id=analyst_user.id if rev_choice != ReviewStatus.PENDING else None,
                review_status=rev_choice,
                analyst_notes=notes,
                action_taken="ACCOUNT_FREEZE" if rev_choice == ReviewStatus.CONFIRMED_FRAUD else None,
                created_at=txn.timestamp,
                updated_at=txn.timestamp + timedelta(hours=random.randint(1, 12))
            )
            db.add(review)

    db.commit()
    print(f">>> Processed {len(transactions)} transactions ({flagged_count} flagged suspicious).")

    print(">>> Seeding Credit Risk Assessment cases...")
    credit_profiles = [
        {"name": "Jonathan Miller", "limit": 150000, "age": 42, "edu": "Graduate School", "mar": "Married", "pay0": -1, "bill": 18500, "pay": 18500},
        {"name": "Sophia Zhang", "limit": 90000, "age": 29, "edu": "University", "mar": "Single", "pay0": 0, "bill": 24000, "pay": 12000},
        {"name": "Liam Gallagher", "limit": 20000, "age": 25, "edu": "High School", "mar": "Single", "pay0": 2, "bill": 19200, "pay": 800},
        {"name": "Amina Al-Mansoor", "limit": 250000, "age": 48, "edu": "Graduate School", "mar": "Married", "pay0": -1, "bill": 32000, "pay": 32000},
        {"name": "Carlos Rodriguez", "limit": 40000, "age": 34, "edu": "University", "mar": "Married", "pay0": 1, "bill": 34000, "pay": 2100},
        {"name": "Emma Watson", "limit": 110000, "age": 38, "edu": "Graduate School", "mar": "Single", "pay0": 0, "bill": 15000, "pay": 15000},
        {"name": "David Kim", "limit": 15000, "age": 23, "edu": "University", "mar": "Single", "pay0": 3, "bill": 14900, "pay": 300},
        {"name": "Fatima Zahra", "limit": 60000, "age": 31, "edu": "University", "mar": "Married", "pay0": 0, "bill": 18000, "pay": 9000},
        {"name": "Alexander Petrov", "limit": 80000, "age": 45, "edu": "University", "mar": "Married", "pay0": 2, "bill": 76000, "pay": 2500},
        {"name": "Chloe Dupont", "limit": 30000, "age": 27, "edu": "Graduate School", "mar": "Single", "pay0": -1, "bill": 4200, "pay": 4200},
        {"name": "Robert Tanaka", "limit": 180000, "age": 52, "edu": "University", "mar": "Married", "pay0": 0, "bill": 22000, "pay": 22000},
        {"name": "Priya Sharma", "limit": 70000, "age": 33, "edu": "Graduate School", "mar": "Single", "pay0": 0, "bill": 14500, "pay": 8000},
    ]

    for idx, cp in enumerate(credit_profiles, 1):
        res = ml_engine.score_credit_application({
            'credit_limit': cp['limit'],
            'age': cp['age'],
            'education_level': cp['edu'],
            'marital_status': cp['mar'],
            'repayment_status_recent': cp['pay0'],
            'repayment_history_sum': cp['pay0'] * 2,
            'avg_bill_amount': cp['bill'],
            'avg_payment_amount': cp['pay'],
            'utilization_ratio': round(cp['bill'] / cp['limit'], 3)
        })

        assessment = CreditAssessment(
            applicant_reference=f"APP-2026-{8800 + idx}",
            applicant_name=cp['name'],
            credit_limit=cp['limit'],
            age=cp['age'],
            education_level=cp['edu'],
            marital_status=cp['mar'],
            repayment_status_recent=cp['pay0'],
            repayment_history_summary=f"{cp['pay0']}, 0, 0, -1, 0, 0",
            avg_bill_amount=cp['bill'],
            avg_payment_amount=cp['pay'],
            utilization_ratio=round(cp['bill'] / cp['limit'], 3),
            probability_of_default=res['probability_of_default'],
            risk_tier=RiskTier(res['risk_tier']),
            key_risk_drivers=json.dumps(res['key_risk_drivers']),
            model_version=res['model_version'],
            assessed_at=now - timedelta(days=random.randint(1, 45), hours=random.randint(1, 18))
        )
        db.add(assessment)

    db.commit()

    print(">>> Seeding Audit Log trail...")
    audit_events = [
        AuditLog(
            user_id=admin_user.id,
            user_email=admin_user.email,
            action="SYSTEM_INITIALIZATION",
            resource_type="SYSTEM",
            resource_id="SYS-CONFIG",
            details="FinGuard AI database initialization and model deployment completed.",
            timestamp=now - timedelta(days=88)
        ),
        AuditLog(
            user_id=analyst_user.id,
            user_email=analyst_user.email,
            action="MODEL_EVALUATION",
            resource_type="ML_MODEL",
            resource_id="finguard-xgb-v1.0",
            details="Validated test set PR-AUC score 0.9994 and tuned decision threshold to 0.6500.",
            timestamp=now - timedelta(days=60)
        ),
        AuditLog(
            user_id=analyst_user.id,
            user_email=analyst_user.email,
            action="UPDATE_REVIEW_STATUS",
            resource_type="FRAUD_REVIEW",
            resource_id="TXN-2601-100234",
            details="Confirmed unauthorized wire transfer fraud. Escalated to card-network chargeback team.",
            timestamp=now - timedelta(days=12)
        ),
        AuditLog(
            user_id=admin_user.id,
            user_email=admin_user.email,
            action="BATCH_SCORING",
            resource_type="TRANSACTION_BATCH",
            resource_id="BATCH-0914",
            details="Executed batch fraud inference across 150 incoming settlement records.",
            timestamp=now - timedelta(days=3)
        ),
    ]
    db.add_all(audit_events)
    db.commit()

    db.close()
    print(">>> Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
