export type UserRole = 'admin' | 'gerente';

export interface AuthPayload {
  sub: string;
  name: string;
  role: UserRole;
}
