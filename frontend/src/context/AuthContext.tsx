import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiGet, apiPost, apiPostPublic } from '../api/client';
import type { LoginResponse, MeResponse } from '../types/api';
import type { UserRole } from '../types/role';

interface AuthState {
  userName: string | null;
  role: UserRole | null;
  authenticated: boolean;
}

interface AuthContextValue extends AuthState {
  ready: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(async () => {
    try {
      await apiPost('/api/auth/logout', {});
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
    setUserName(null);
    setRole(null);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setAuthenticated(false);
      setUserName(null);
      setRole(null);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      try {
        const me = await apiGet<MeResponse>('/api/auth/me');
        if (!cancelled) {
          setAuthenticated(true);
          setUserName(me.userName);
          setRole(me.role);
        }
      } catch {
        if (!cancelled) {
          setAuthenticated(false);
          setUserName(null);
          setRole(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    validate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (u: string, p: string) => {
    const res = await apiPostPublic<LoginResponse, { userName: string; password: string }>(
      '/api/auth/login',
      { userName: u.trim(), password: p },
    );
    setAuthenticated(true);
    setUserName(res.userName);
    setRole(res.role);
    setReady(true);
  }, []);

  const value = useMemo(
    () => ({
      userName,
      role,
      authenticated,
      ready,
      login,
      logout,
    }),
    [userName, role, authenticated, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth dentro de AuthProvider');
  return ctx;
}

/** Solo dentro de rutas autenticadas (RequireAuth). */
export function useRole(): UserRole {
  const { role } = useAuth();
  if (!role) throw new Error('useRole: sin sesión');
  return role;
}
