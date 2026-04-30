import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '@/assets/logo.jpg';

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
          <div className="login-logo-ring">
            <img src={logo} alt="logo" />
          </div>
          <div className="login-brand">INNOVA</div>
          <p className="login-sub">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* 🔥 LOGO */}
        <div className="login-logo-ring">
          <img src={logo} alt="logo" />
        </div>

        <div className="login-brand">INNOVA</div>
        <p className="login-sub">Ingresa con tu usuario institucional</p>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-field">
            <label>Usuario</label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="admin o gerente"
            />
          </div>

          <div className="form-field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-primary login-submit" disabled={pending}>
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}