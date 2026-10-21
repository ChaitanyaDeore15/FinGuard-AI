import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { FraudPage } from './pages/FraudPage';
import { CreditRiskPage } from './pages/CreditRiskPage';
import { ModelLabPage } from './pages/ModelLabPage';
import { AuditPage } from './pages/AuditPage';
import { DocumentationPage } from './pages/DocumentationPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Login */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Dashboard Core */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/:id" element={<TransactionDetailPage />} />
            <Route path="/fraud" element={<FraudPage />} />
            <Route path="/credit" element={<CreditRiskPage />} />
            <Route path="/model-lab" element={<ModelLabPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
