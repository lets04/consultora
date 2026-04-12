export type UserRole = 'admin' | 'gerente';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administración',
  gerente: 'Gerencia',
};
