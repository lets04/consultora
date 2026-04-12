import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, authenticated, role, userName } = useAuth();

  if (!ready) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-inner">Cargando…</div>
      </div>
    );
  }

  if (!authenticated || !role || !userName) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
