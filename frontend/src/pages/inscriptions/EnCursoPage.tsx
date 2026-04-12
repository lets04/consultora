import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";
import type { InscripcionDto } from "../../types/api";

export function EnCursoPage() {
  const [rows, setRows] = useState<InscripcionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<InscripcionDto[]>("/api/inscriptions")
      .then((data) => {
        if (!cancelled)
          setRows(data.filter((item) => item.estadoPago !== "pagado"));
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

  if (loading)
    return <div className="empty-hint">Cargando inscripciones en curso…</div>;
  if (error) return <div className="empty-hint">{error}</div>;

  if (rows.length === 0) {
    return <div className="empty-hint">No hay inscripciones en curso.</div>;
  }

  return (
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
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ fontWeight: 500, color: "#0B2A4A" }}>
                {r.estudiante}
              </td>
              <td>{r.curso}</td>
              <td>{r.tipo}</td>
              <td>{r.modalidad}</td>
              <td>{r.fecha}</td>
              <td>
                <span className={"bs " + r.estadoPago}>
                  {r.estadoPago === "pendiente" && "Pendiente"}
                  {r.estadoPago === "parcial" && "Parcial"}
                  {r.estadoPago === "pagado" && "Pagado"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
