import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function StudentPortalLoginPage() {
  const navigate = useNavigate();
  const [ci, setCi] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanCi = ci.trim();

    if (!cleanCi) {
      setError("Ingresa tu CI para consultar tu información.");
      return;
    }

    setError(null);
    navigate(`/portal-estudiante/${encodeURIComponent(cleanCi)}`);
  }

  return (
    <div className="login-page portal-page-bg">
      <div className="login-card portal-login-card">
        <div className="login-brand">INNOVA</div>
        <p className="login-sub">
          Consulta tus datos personales y los cursos que ya terminaste de pagar.
        </p>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="student-ci">Carnet de identidad</label>
            <input
              id="student-ci"
              name="ci"
              autoComplete="off"
              value={ci}
              onChange={(ev) => setCi(ev.target.value)}
              placeholder="Ej. 12345678"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-primary login-submit">
            Consultar información
          </button>
        </form>
      </div>
    </div>
  );
}
