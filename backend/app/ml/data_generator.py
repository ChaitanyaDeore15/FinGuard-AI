"""
Synthetic Financial Data Generator for FinGuard AI.
Generates realistic fraud detection and credit risk assessment datasets
derived from public benchmark distributions (European Cardholders Fraud & UCI Default Credit).
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_fraud_dataset(n_samples: int = 10000, fraud_rate: float = 0.015, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic transaction fraud dataset.
    Features:
      - amount: log-normal distribution with fraud skewing higher or micro-probing
      - hour: transaction hour of day (fraud skewed towards late night 1-5 AM)
      - merchant_category: category with empirical risk multipliers
      - transaction_type: POS, ONLINE, ATM, WIRE
      - is_international: binary flag
      - velocity_1h: transactions in past hour
      - amount_to_avg_ratio: current amount relative to account's typical spend
      - ip_risk_score: 0.0 to 1.0 proxy indicator
    """
    np.random.seed(random_state)
    n_fraud = int(n_samples * fraud_rate)
    n_legit = n_samples - n_fraud

    # 1. Legitimate transactions
    legit_amounts = np.random.lognormal(mean=3.5, sigma=1.0, size=n_legit) # avg ~$40-$100
    p_legit_hours = np.array([
        0.01, 0.01, 0.005, 0.005, 0.01, 0.02, # 0-5
        0.04, 0.06, 0.08, 0.08, 0.08, 0.08,   # 6-11
        0.08, 0.07, 0.07, 0.07, 0.07, 0.07,   # 12-17
        0.06, 0.05, 0.03, 0.02, 0.01, 0.005   # 18-23
    ])
    p_legit_hours = p_legit_hours / p_legit_hours.sum()
    legit_hours = np.random.choice(24, size=n_legit, p=p_legit_hours)

    p_legit_cat = np.array([0.30, 0.22, 0.15, 0.10, 0.08, 0.08, 0.05, 0.02])
    p_legit_cat = p_legit_cat / p_legit_cat.sum()
    legit_categories = np.random.choice(
        ['Groceries', 'Dining', 'Utilities', 'Electronics', 'Travel', 'Healthcare', 'Entertainment', 'Crypto/Gaming'],
        size=n_legit,
        p=p_legit_cat
    )

    p_legit_types = np.array([0.45, 0.35, 0.12, 0.06, 0.02])
    p_legit_types = p_legit_types / p_legit_types.sum()
    legit_types = np.random.choice(
        ['POS', 'ONLINE', 'MOBILE_PAYMENT', 'ATM_WITHDRAWAL', 'WIRE_TRANSFER'],
        size=n_legit,
        p=p_legit_types
    )
    legit_intl = np.random.binomial(1, 0.04, size=n_legit)
    legit_velocity = np.random.poisson(0.3, size=n_legit) + 1
    legit_ratio = np.random.lognormal(0.0, 0.35, size=n_legit)
    legit_ip_risk = np.random.beta(1.5, 8.0, size=n_legit) # heavily skewed low

    # 2. Fraudulent transactions
    fraud_amounts_large = np.random.lognormal(mean=6.5, sigma=1.1, size=int(n_fraud * 0.8)) # $400 - $3500+
    fraud_amounts_probe = np.random.uniform(1.0, 15.0, size=n_fraud - int(n_fraud * 0.8)) # micro-testing
    fraud_amounts = np.concatenate([fraud_amounts_large, fraud_amounts_probe])
    np.random.shuffle(fraud_amounts)

    p_fraud_hours = np.array([
        0.08, 0.10, 0.12, 0.12, 0.09, 0.05, # 0-5
        0.03, 0.02, 0.02, 0.03, 0.03, 0.03, # 6-11
        0.03, 0.03, 0.04, 0.04, 0.04, 0.04, # 12-17
        0.05, 0.05, 0.06, 0.07, 0.08, 0.08  # 18-23
    ])
    p_fraud_hours = p_fraud_hours / p_fraud_hours.sum()
    fraud_hours = np.random.choice(24, size=n_fraud, p=p_fraud_hours)

    p_fraud_cat = np.array([0.05, 0.05, 0.02, 0.30, 0.25, 0.03, 0.10, 0.20])
    p_fraud_cat = p_fraud_cat / p_fraud_cat.sum()
    fraud_categories = np.random.choice(
        ['Groceries', 'Dining', 'Utilities', 'Electronics', 'Travel', 'Healthcare', 'Entertainment', 'Crypto/Gaming'],
        size=n_fraud,
        p=p_fraud_cat
    )

    p_fraud_types = np.array([0.05, 0.60, 0.10, 0.05, 0.20])
    p_fraud_types = p_fraud_types / p_fraud_types.sum()
    fraud_types = np.random.choice(
        ['POS', 'ONLINE', 'MOBILE_PAYMENT', 'ATM_WITHDRAWAL', 'WIRE_TRANSFER'],
        size=n_fraud,
        p=p_fraud_types
    )
    fraud_intl = np.random.binomial(1, 0.42, size=n_fraud)
    fraud_velocity = np.random.poisson(2.5, size=n_fraud) + 2
    fraud_ratio = np.random.lognormal(1.6, 0.8, size=n_fraud) # high ratio compared to typical
    fraud_ip_risk = np.random.beta(6.0, 2.0, size=n_fraud) # high risk ip

    df_legit = pd.DataFrame({
        'amount': np.round(legit_amounts, 2),
        'hour': legit_hours,
        'merchant_category': legit_categories,
        'transaction_type': legit_types,
        'is_international': legit_intl,
        'velocity_1h': legit_velocity,
        'amount_to_avg_ratio': np.round(legit_ratio, 2),
        'ip_risk_score': np.round(legit_ip_risk, 3),
        'is_fraud': 0
    })

    df_fraud = pd.DataFrame({
        'amount': np.round(fraud_amounts, 2),
        'hour': fraud_hours,
        'merchant_category': fraud_categories,
        'transaction_type': fraud_types,
        'is_international': fraud_intl,
        'velocity_1h': fraud_velocity,
        'amount_to_avg_ratio': np.round(fraud_ratio, 2),
        'ip_risk_score': np.round(fraud_ip_risk, 3),
        'is_fraud': 1
    })

    df = pd.concat([df_legit, df_fraud], ignore_index=True)
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df


def generate_credit_dataset(n_samples: int = 8000, default_rate: float = 0.22, random_state: int = 42) -> pd.DataFrame:
    """
    Generates dataset structured identically to UCI Default of Credit Card Clients Dataset.
    Features:
      - LIMIT_BAL: Credit limit (NTD / USD)
      - AGE: Applicant age
      - EDUCATION: 1=Grad School, 2=University, 3=High School, 4=Others
      - MARRIAGE: 1=Married, 2=Single, 3=Others
      - PAY_0 to PAY_6: Repayment status in past 6 months (-1=pay duly, 0=revolving, 1=delay 1 mo, etc.)
      - BILL_AMT_AVG: Average monthly statement balance
      - PAY_AMT_AVG: Average monthly payment made
      - UTILIZATION: Balance to credit limit ratio
      - DEFAULT_PAYMENT_NEXT_MONTH: Target (0 or 1)
    """
    np.random.seed(random_state)
    n_default = int(n_samples * default_rate)
    n_nodefault = n_samples - n_default

    def _norm(arr):
        a = np.array(arr, dtype=float)
        return a / a.sum()

    # Non-defaulters
    limits_no = np.random.choice([20000, 30000, 50000, 80000, 120000, 200000, 350000, 500000], size=n_nodefault,
                                p=_norm([0.10, 0.12, 0.20, 0.20, 0.18, 0.12, 0.05, 0.03]))
    age_no = np.clip(np.random.normal(36, 9, size=n_nodefault).astype(int), 21, 75)
    edu_no = np.random.choice([1, 2, 3, 4], size=n_nodefault, p=_norm([0.40, 0.45, 0.12, 0.03]))
    mar_no = np.random.choice([1, 2, 3], size=n_nodefault, p=_norm([0.46, 0.51, 0.03]))
    pay0_no = np.random.choice([-1, 0, 1, 2], size=n_nodefault, p=_norm([0.40, 0.50, 0.08, 0.02]))
    pay_history_sum_no = np.clip(pay0_no + np.random.randint(-1, 2, size=n_nodefault), -1, 5)
    utilization_no = np.clip(np.random.beta(2.0, 5.0, size=n_nodefault), 0.01, 0.95)
    bill_no = limits_no * utilization_no
    pay_ratio_no = np.clip(np.random.beta(6.0, 2.0, size=n_nodefault), 0.1, 1.2)
    pay_no = bill_no * pay_ratio_no

    # Defaulters
    limits_def = np.random.choice([10000, 20000, 30000, 50000, 80000, 120000, 200000], size=n_default,
                                  p=_norm([0.20, 0.25, 0.22, 0.18, 0.10, 0.04, 0.01]))
    age_def = np.clip(np.random.normal(34, 10, size=n_default).astype(int), 21, 75)
    edu_def = np.random.choice([1, 2, 3, 4], size=n_default, p=_norm([0.25, 0.48, 0.23, 0.04]))
    mar_def = np.random.choice([1, 2, 3], size=n_default, p=_norm([0.48, 0.48, 0.04]))
    pay0_def = np.random.choice([-1, 0, 1, 2, 3, 4], size=n_default, p=_norm([0.05, 0.20, 0.35, 0.25, 0.10, 0.05]))
    pay_history_sum_def = np.clip(pay0_def + np.random.randint(0, 3, size=n_default), 0, 8)
    utilization_def = np.clip(np.random.beta(5.0, 2.0, size=n_default), 0.20, 1.15)
    bill_def = limits_def * utilization_def
    pay_ratio_def = np.clip(np.random.beta(1.5, 5.0, size=n_default), 0.01, 0.6)
    pay_def = bill_def * pay_ratio_def

    df_no = pd.DataFrame({
        'LIMIT_BAL': limits_no,
        'AGE': age_no,
        'EDUCATION': edu_no,
        'MARRIAGE': mar_no,
        'PAY_0': pay0_no,
        'PAY_SUM': pay_history_sum_no,
        'BILL_AMT_AVG': np.round(bill_no, 2),
        'PAY_AMT_AVG': np.round(pay_no, 2),
        'UTILIZATION': np.round(utilization_no, 3),
        'PAYMENT_RATIO': np.round(pay_ratio_no, 3),
        'DEFAULT_PAYMENT_NEXT_MONTH': 0
    })

    df_def = pd.DataFrame({
        'LIMIT_BAL': limits_def,
        'AGE': age_def,
        'EDUCATION': edu_def,
        'MARRIAGE': mar_def,
        'PAY_0': pay0_def,
        'PAY_SUM': pay_history_sum_def,
        'BILL_AMT_AVG': np.round(bill_def, 2),
        'PAY_AMT_AVG': np.round(pay_def, 2),
        'UTILIZATION': np.round(utilization_def, 3),
        'PAYMENT_RATIO': np.round(pay_ratio_def, 3),
        'DEFAULT_PAYMENT_NEXT_MONTH': 1
    })

    df = pd.concat([df_no, df_def], ignore_index=True)
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df
