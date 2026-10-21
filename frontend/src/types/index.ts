export type UserRole = 'ADMIN' | 'RISK_ANALYST' | 'COMPLIANCE_OFFICER';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  username: string;
  full_name: string;
}

export type TransactionType = 'POS' | 'ONLINE' | 'ATM_WITHDRAWAL' | 'WIRE_TRANSFER' | 'MOBILE_PAYMENT';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FLAGGED' | 'DECLINED';
export type ReviewStatus = 'PENDING' | 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'CLEARED';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Transaction {
  id: number;
  transaction_reference: string;
  account_id: string;
  amount: number;
  currency: string;
  merchant_name: string;
  merchant_category: string;
  transaction_type: TransactionType;
  channel: string;
  status: TransactionStatus;
  country_code: string;
  is_international: boolean;
  timestamp: string;
  created_at: string;
  fraud_risk_score?: number;
  is_flagged?: boolean;
}

export interface TransactionKPIs {
  total_volume: number;
  total_count: number;
  avg_transaction_value: number;
  flagged_count: number;
  flagged_volume: number;
  flagged_rate_pct: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DailyTrend {
  date: string;
  volume: number;
  count: number;
  flagged_count: number;
}

export interface MerchantSpending {
  merchant_name: string;
  merchant_category: string;
  total_amount: number;
  transaction_count: number;
}

export interface RiskFactor {
  factor: string;
  impact: string;
  contribution: number;
  description: string;
}

export interface FraudScoreResponse {
  risk_score: number;
  is_flagged: boolean;
  threshold_used: number;
  predicted_label: number;
  model_version: string;
  risk_factors: RiskFactor[];
}

export interface FraudAlertItem {
  review_id: number;
  transaction_id: number;
  transaction_reference: string;
  account_id: string;
  amount: number;
  currency: string;
  timestamp: string;
  merchant_name: string;
  merchant_category: string;
  risk_score: number;
  is_flagged: boolean;
  review_status: ReviewStatus;
  analyst_notes?: string;
  risk_factors: RiskFactor[];
}

export interface CreditRiskAssessment {
  id: number;
  applicant_reference: string;
  applicant_name: string;
  credit_limit: number;
  age: number;
  education_level: string;
  marital_status: string;
  repayment_status_recent: number;
  avg_bill_amount: number;
  avg_payment_amount: number;
  utilization_ratio: number;
  probability_of_default: number;
  risk_tier: RiskTier;
  key_risk_drivers: RiskFactor[];
  assessed_at: string;
}

export interface CreditPortfolioSummary {
  total_applicants: number;
  tiers: {
    tier: RiskTier;
    count: number;
    percentage: number;
    avg_probability_of_default: number;
  }[];
}

export interface ModelRegistryItem {
  id: number;
  model_name: string;
  model_type: string;
  model_version: string;
  target_domain: 'FRAUD' | 'CREDIT';
  dataset_name: string;
  dataset_records: number;
  train_test_split: string;
  pr_auc: number;
  roc_auc: number;
  precision: number;
  recall: number;
  f1_score: number;
  optimal_threshold: number;
  confusion_matrix: { tn: number; fp: number; fn: number; tp: number };
  feature_importances: { feature: string; importance: number }[];
  is_active: boolean;
  trained_at: string;
}

export interface AuditLogItem {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address: string;
  timestamp: string;
}

export interface DashboardSummary {
  kpis: {
    total_transactions: number;
    total_volume: number;
    avg_transaction_value: number;
    flagged_transactions: number;
    fraud_rate_pct: number;
    pending_reviews: number;
    confirmed_fraud: number;
    false_positives: number;
  };
  credit_portfolio: {
    total_evaluated: number;
    low_risk_count: number;
    medium_risk_count: number;
    high_risk_count: number;
    high_risk_rate_pct: number;
  };
  recent_alerts: {
    review_id: number;
    transaction_reference: string;
    merchant_name: string;
    merchant_category: string;
    amount: number;
    currency: string;
    timestamp: string;
    risk_score: number;
    review_status: string;
  }[];
  active_models: {
    fraud_model: {
      name: string;
      version: string;
      pr_auc: number;
      roc_auc: number;
      threshold: number;
    };
    credit_model: {
      name: string;
      version: string;
      roc_auc: number;
      pr_auc: number;
    };
  };
}
