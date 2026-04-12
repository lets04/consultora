import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useRole } from '../context/AuthContext';
import type { UserRole } from '../types/role';

export function RoleGuard({
  allow,
  children,
}: {
  allow: UserRole[];
  children: ReactNode;
}) {
  const role = useRole();
  if (!allow.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
