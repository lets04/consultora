import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../../api/client";
import type { StudentPortalDto } from "../../types/api";
import logo from "@/assets/logo.jpg";
import "./StudentPortalPage.css";

export function StudentPortalPage() {
  const navigate = useNavigate();
  const { ci } = useParams<{ ci: string }>();
  const [student, setStudent] = useState<StudentPortalDto | null | undefined>(
    undefined,
  );
  const [empresa, setEmpresa] = useState<any>(null);

  useEffect(() => {
    if (!ci) {
      setStudent(null);
      return;
    }

    let cancelled = false;

    apiGet<StudentPortalDto>(`/api/student-portal/${encodeURIComponent(ci)}`)
      .then((data) => {
        if (!cancelled) setStudent(data);
      })
      .catch(() => {
        if (!cancelled) setStudent(null);
      });

    apiGet("/api/empresa")
      .then((data) => {
        if (!cancelled) setEmpresa(data);
      })
      .catch(() => {
        if (!cancelled) setEmpresa(null);
      });

    return () => {
      cancelled = true;
    };
  }, [ci]);

  if (student === undefined)
    return <div className="loading-state">Cargando...</div>;
  if (!student) {
    navigate("/portal-estudiante");
    return null;
  }

  const displayName = student.prefijo
    ? `${student.prefijo} ${student.nombreCompleto}`
    : student.nombreCompleto;

  return (
    <div className="portal-container">
      <header className="main-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="logo-box">
              <img src={logo} alt="Innova" />
            </div>
            <div className="brand-titles">
              <h1>CONSULTORA INNOVA</h1>

              <p>
                NIT: 700536037 | SEPREC: 700810038
                {empresa?.registroMinisterial && (
                  <> | REGISTRO MINISTERIAL: {empresa.registroMinisterial}</>
                )}
              </p>
            </div>
          </div>

          <button
            className="logout-minimal"
            onClick={() => navigate("/portal-estudiante")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      <main className="content-wrapper">
        {/* PERFIL: Centrado totalmente */}
        <section className="hero-section">
          <h2 className="user-name">{displayName}</h2>
          <div className="user-meta">
            <span className="ci-tag">CI: {student.ci}</span>
          </div>
        </section>

        {/* INFO: Fila horizontal simétrica */}
        <div className="info-strip">
          <div className="info-cell">
            <label>Profesión</label>
            <strong>{student.profesion || "No definida"}</strong>
          </div>
          <div className="info-cell">
            <label>Teléfono</label>
            <strong>{student.telefono || "—"}</strong>
          </div>
          <div className="info-cell">
            <label>Correo Electrónico</label>
            <strong>{student.email || "—"}</strong>
          </div>
          <div className="info-cell">
            <label>Sede</label>
            <strong>{student.departamento || "Oruro"}</strong>
          </div>
        </div>

        {/* CURSOS: Centrados */}
        <section className="records-section">
          <h3 className="section-label">Información Académica</h3>
          <div className="records-container">
            {student.cursos.map((course) => (
              <div key={course.id} className="course-card-modern">
                <div className="course-main-info">
                  <h4>{course.nombre}</h4>
                  <p>
                    {course.area} • {course.promocionNombre}
                  </p>
                </div>
                <div className="course-score-area">
                  {course.modalidad === "examen" ? (
                    <div
                      className={`score-badge ${Number(course.nota) >= 71 ? "pass" : "fail"}`}
                    >
                      <span className="score-label">
                        {Number(course.nota) >= 71
                          ? "NOTA DE APROBACIÓN:"
                          : "NOTA:"}
                      </span>
                      <span className="score-value">{course.nota ?? "—"}</span>
                    </div>
                  ) : (
                    <span className="cert-pill">Certificado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
