import {
  AuthResponse, DashboardSummary, Transaction, TransactionKPIs,
  CategorySpending, DailyTrend, MerchantSpending, FraudScoreResponse,
  FraudAlertItem, CreditRiskAssessment, CreditPortfolioSummary,
  ModelRegistryItem, AuditLogItem
} from '../types';

const BASE_URL = '/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('finguard_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Authentication failed');
    }
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  // Transactions
  async getTransactions(params: Record<string, any> = {}): Promise<{
    items: Transaction[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        query.append(k, String(v));
      }
    });
    const res = await fetch(`${BASE_URL}/transactions?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getTransactionDetail(id: number) {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch transaction details');
    return res.json();
  },

  async getTransactionKPIs(startDate?: string, endDate?: string): Promise<TransactionKPIs> {
    const query = new URLSearchParams();
    if (startDate) query.append('start_date', startDate);
    if (endDate) query.append('end_date', endDate);
    const res = await fetch(`${BASE_URL}/transactions/analytics/kpis?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch transaction KPIs');
    return res.json();
  },

  async getCategorySpending(): Promise<CategorySpending[]> {
    const res = await fetch(`${BASE_URL}/transactions/analytics/categories`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getDailyTrends(days = 30): Promise<DailyTrend[]> {
    const res = await fetch(`${BASE_URL}/transactions/analytics/trends?days=${days}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch daily trends');
    return res.json();
  },

  async getTopMerchants(limit = 10): Promise<MerchantSpending[]> {
    const res = await fetch(`${BASE_URL}/transactions/analytics/merchants?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch merchant spending');
    return res.json();
  },

  async importCSV(file: File) {
    const token = localStorage.getItem('finguard_token');
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/transactions/import-csv`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  getExportCSVUrl(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        query.append(k, String(v));
      }
    });
    return `${BASE_URL}/transactions/export/csv?${query.toString()}`;
  },

  // Fraud
  async scoreTransaction(payload: any): Promise<FraudScoreResponse> {
    const res = await fetch(`${BASE_URL}/fraud/score`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to score transaction');
    return res.json();
  },

  async getFraudAlerts(statusFilter = 'ALL'): Promise<FraudAlertItem[]> {
    const res = await fetch(`${BASE_URL}/fraud/alerts?status_filter=${statusFilter}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch fraud alerts');
    return res.json();
  },

  async updateReviewStatus(reviewId: number, update: { review_status: string; analyst_notes?: string; action_taken?: string }) {
    const res = await fetch(`${BASE_URL}/fraud/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error('Failed to update review status');
    return res.json();
  },

  async getFraudDistribution() {
    const res = await fetch(`${BASE_URL}/fraud/distribution`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch risk distribution');
    return res.json();
  },

  // Credit
  async assessCreditRisk(payload: any): Promise<{
    probability_of_default: number;
    risk_tier: string;
    credit_score_equivalent: number;
    model_version: string;
    key_risk_drivers: any[];
  }> {
    const res = await fetch(`${BASE_URL}/credit/assess`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to evaluate credit risk');
    return res.json();
  },

  async getCreditAssessments(tier = 'ALL'): Promise<CreditRiskAssessment[]> {
    const res = await fetch(`${BASE_URL}/credit/assessments?tier=${tier}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch credit assessments');
    return res.json();
  },

  async getCreditPortfolioSummary(): Promise<CreditPortfolioSummary> {
    const res = await fetch(`${BASE_URL}/credit/portfolio-summary`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch credit summary');
    return res.json();
  },

  // Models
  async getModels(): Promise<ModelRegistryItem[]> {
    const res = await fetch(`${BASE_URL}/models`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch model registry');
    return res.json();
  },

  async getEvaluationDetails() {
    const res = await fetch(`${BASE_URL}/models/evaluation-details`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch evaluation details');
    return res.json();
  },

  // Audit
  async getAuditLogs(action?: string): Promise<AuditLogItem[]> {
    const query = action ? `?action=${action}` : '';
    const res = await fetch(`${BASE_URL}/audit/logs${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Health
  async getHealth() {
    const res = await fetch('/health');
    return res.json();
  }
};
