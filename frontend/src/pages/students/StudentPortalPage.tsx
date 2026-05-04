import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../../api/client";
import type { StudentPortalDto } from "../../types/api";

export function StudentPortalPage() {
  const navigate = useNavigate();
  const { ci } = useParams<{ ci: string }>();
  const [student, setStudent] = useState<StudentPortalDto | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!ci) {
      setStudent(null);
      return;
    }

    let cancelled = false;
    setStudent(undefined);

    apiGet<StudentPortalDto>(`/api/student-portal/${encodeURIComponent(ci)}`)
      .then((data) => {
        if (!cancelled) setStudent(data);
      })
      .catch(() => {
        if (!cancelled) setStudent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [ci]);

  if (student === undefined) {
    return <div className="empty-hint">Cargando información…</div>;
  }
  if (!student) {
    navigate("/portal-estudiante");
    return null;
  }

  const displayName = student.prefijo
    ? `${student.prefijo} ${student.nombreCompleto}`
    : student.nombreCompleto;

  return (
    <div className="portal-shell">
      <div className="portal-wrapper">
        <div className="sec-header">
          <div>
            <h2>Portal del estudiante</h2>
            <p className="portal-muted">
              Consulta tu perfil y tu información académica.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/portal-estudiante")}
          >
            Salir
          </button>
        </div>

        <div className="card portal-card">
          <div className="student-profile portal-profile">
            <div className="student-avatar">
              {student.nombreCompleto
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="student-name">{displayName}</div>
              <div className="student-ci">CI: {student.ci}</div>
            </div>
          </div>

          <div className="portal-grid">
            <div className="card">
              <div className="form-section-title">Datos personales</div>
              <div className="info-row">
                <span className="info-label">Nombre completo</span>
                <span className="info-value">{displayName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Profesión</span>
                <span className="info-value">
                  {student.profesion || "No registrada"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Teléfono</span>
                <span className="info-value">
                  {student.telefono || "No registrado"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Correo</span>
                <span className="info-value">
                  {student.email || "No registrado"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Departamento</span>
                <span className="info-value">
                  {student.departamento || "No registrado"}
                </span>
              </div>
            </div>

            <div className="card">
              <div className="form-section-title">Cursos</div>

              {student.cursos.length === 0 ? (
                <div className="empty-hint portal-empty">
                  Aún no tienes cursos con pago completado.
                </div>
              ) : (
                <div className="portal-course-list">
                  {student.cursos.map((course) => (
                    <div key={course.id} className="portal-course-item">
                      <div className="portal-course-head">
                        <div>
                          <div className="portal-course-name">
                            {course.nombre}
                          </div>
                          <div className="portal-course-meta">
                            {course.area}
                            {course.promocionNombre
                              ? ` · ${course.promocionNombre}`
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="portal-course-details">
                        <span>Inscripción: {course.fechaInscripcion}</span>
                        {course.modalidad === "examen" ? (
                          <span>
                            Nota:{" "}
                            {course.nota != null ? course.nota : "Pendiente"}
                          </span>
                        ) : (
                          <span>Curso con certificado</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
