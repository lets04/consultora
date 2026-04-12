import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, ready, authenticated, role } = useAuth();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && authenticated && role) {
      navigate('/dashboard', { replace: true });
    }
  }, [ready, authenticated, role, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(userName, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-brand">INNOVA</div>
          <p className="login-sub">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">INNOVA</div>
        <p className="login-sub">Ingresa con tu usuario institucional</p>
        <form onSubmit={onSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="user">Usuario</label>
            <input
              id="user"
              name="userName"
              autoComplete="username"
              value={userName}
              onChange={(ev) => setUserName(ev.target.value)}
              placeholder="admin o gerente"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="pass">Contraseña</label>
            <input
              id="pass"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn-primary login-submit" disabled={pending}>
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <div className="login-hint">
          <strong>Demo:</strong> admin / admin123 · gerente / gerente123
        </div>
      </div>
    </div>
  );
}
