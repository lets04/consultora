import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../api/client";
import type { InscripcionDto } from "../../types/api";

export function InscripcionesPage() {
  const [rows, setRows] = useState<InscripcionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    let cancelled = false;
    apiGet<InscripcionDto[]>("/api/inscriptions")
      .then((d) => {
        if (!cancelled) setRows(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="empty-hint">Cargando inscripciones…</div>;
  if (error) return <div className="empty-hint">{error}</div>;

  return (
    <>
      <div className="sec-header">
        <h2></h2>
        <Link to="/inscripciones/nueva" className="btn-primary">
          + Nueva inscripción
        </Link>
      </div>
      <div className="card">
        <div className="form-section-title">Inscripciones en curso</div>
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Tipo</th>
              <th>Modalidad</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .slice()
              .reverse()
              .slice(0, displayLimit)
              .map((r) => (
              <tr key={`${r.estudiante}-${r.curso}-${r.fecha}`}>
                <td style={{ fontWeight: 500, color: "#0B2A4A" }}>
                  {r.estudiante}
                </td>
                <td>{r.curso}</td>
                <td>
                  <span
                    style={{
                      background:
                        r.tipo === "Individual" ? "#f0fdf4" : "#eef3ff",
                      color: r.tipo === "Individual" ? "#15803d" : "#1E4BB8",
                      fontSize: 11,
                      padding: "2px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {r.tipo}
                  </span>
                </td>
                <td style={{ fontSize: 11.5 }}>{r.modalidad}</td>
                <td>{r.fecha}</td>
                <td>
                  <span className={"bs " + r.estadoPago}>{r.estadoPago}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayLimit < rows.length && (
          <div style={{ textAlign: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDisplayLimit(prev => prev + 10)}
              style={{ fontSize: 13 }}
            >
              Ver más +
            </button>
          </div>
        )}
      </div>
    </>
  );
}
