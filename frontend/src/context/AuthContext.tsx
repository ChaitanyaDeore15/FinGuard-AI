import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, { email: string; pass: string; name: string }> = {
  ADMIN: { email: 'admin@finguard.ai', pass: 'AdminPassword123!', name: 'Sarah Chen (Chief Risk Officer)' },
  RISK_ANALYST: { email: 'analyst@finguard.ai', pass: 'AnalystPassword123!', name: 'Marcus Vance (Senior Fraud Analyst)' },
  COMPLIANCE_OFFICER: { email: 'auditor@finguard.ai', pass: 'AuditorPassword123!', name: 'Elena Rostova (Compliance Auditor)' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('RISK_ANALYST');
  const [token, setToken] = useState<string | null>(localStorage.getItem('finguard_token'));

  useEffect(() => {
    // If token exists, load profile or default to demo analyst
    if (token) {
      api.getCurrentUser()
        .then((u) => {
          setUser(u);
          setRole(u.role);
        })
        .catch(() => {
          switchDemoUser('RISK_ANALYST');
        });
    } else {
      switchDemoUser('RISK_ANALYST');
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('finguard_token', res.access_token);
    setToken(res.access_token);
    setRole(res.role);
    setUser({
      id: 1,
      email,
      username: res.username,
      full_name: res.full_name,
      role: res.role,
      is_active: true,
      created_at: new Date().toISOString(),
    });
  };

  const switchDemoUser = async (newRole: UserRole) => {
    const creds = DEMO_USERS[newRole];
    try {
      const res = await api.login(creds.email, creds.pass);
      localStorage.setItem('finguard_token', res.access_token);
      setToken(res.access_token);
      setRole(newRole);
      setUser({
        id: newRole === 'ADMIN' ? 1 : (newRole === 'RISK_ANALYST' ? 2 : 3),
        email: creds.email,
        username: creds.email.split('@')[0],
        full_name: creds.name,
        role: newRole,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      // Fallback state
      setRole(newRole);
      setUser({
        id: 2,
        email: creds.email,
        username: 'analyst',
        full_name: creds.name,
        role: newRole,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('finguard_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        login,
        logout,
        switchDemoUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
