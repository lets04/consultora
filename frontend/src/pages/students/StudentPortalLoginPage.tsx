import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/client";

import logo from "@/assets/logo.jpg";

export function StudentPortalLoginPage() {
  const navigate = useNavigate();
  const [ci, setCi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanCi = ci.trim();

    if (!cleanCi || cleanCi.length < 5) {
      setError("Ingresa tu CI para consultar tu información.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // validas antes de navegar
      await apiGet(`/api/student-portal/${encodeURIComponent(cleanCi)}`);

      // solo navega si existe
      navigate(`/portal-estudiante/${encodeURIComponent(cleanCi)}`);
    } catch {
      // si no existe, error en el mismo login
      setError("No se encontró ningún estudiante con ese número de carnet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="innova-root">
      <div className="innova-card">
        <div className="innova-header">
          <div className="innova-logo-ring">
            <img src={logo} alt="Logo" />
          </div>
        </div>

        <div className="innova-divider" />
        <div className="innova-badges">
          <div className="innova-badge">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            SEPREC: 700810038
          </div>

          <div className="innova-badge">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-4 0v2" />
            </svg>
            NIT: 700536037
          </div>
        </div>
        <div className="innova-body">
          <form onSubmit={onSubmit}>
            <label className="innova-label">Carnet de identidad</label>

            <input
              className="innova-input"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              placeholder=""
            />

            {error && <div className="innova-error">{error}</div>}

            <button className="innova-btn" disabled={loading}>
              {loading ? "Consultando..." : "Consultar información"}
            </button>
          </form>

          <div className="innova-social">
            <span>Síguenos</span>
            <div className="innova-social-links">
              <a
                className="innova-social-link"
                href="https://www.facebook.com/profile.php?id=61584442896247"
                target="_blank"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Facebook
              </a>

              <a
                className="innova-social-link"
                href="https://www.instagram.com/innovaconsult.25?igsh=MXE5NzRwbWVmaTkzaw=="
                target="_blank"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
