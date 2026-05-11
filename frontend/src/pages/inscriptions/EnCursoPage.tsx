import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../api/client";
import type { InscripcionDto } from "../../types/api";

type Modalidad = "certificado" | "examen";

const MODALIDAD_OPTIONS = [
  { value: "certificado", label: "Certificado" },
  { value: "examen", label: "Examen" },
];

export function EnCursoPage() {
  const [rows, setRows] = useState<InscripcionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiGet<InscripcionDto[]>("/api/inscriptions")
      .then((data) => {
        if (!cancelled) {
          setRows(
            data.filter((item) => item.estadoPago !== "pagado"),
          );
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return rows;

    return rows.filter((item) =>
      item.estudiante.toLowerCase().includes(search),
    );
  }, [rows, q]);

  if (loading) {
    return (
      <div className="empty-hint">
        Cargando inscripciones en curso…
      </div>
    );
  }

  if (error) {
    return <div className="empty-hint">{error}</div>;
  }

  if (filteredRows.length === 0) {
    return (
      <div className="empty-hint">
        No hay inscripciones en curso.
      </div>
    );
  }

  return (
    <>
      <div
        className="filters-row"
        style={{ gap: 12, marginBottom: 16 }}
      >
        <div className="search-bar" style={{ flex: 1 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>
            ⌕
          </span>

          <input
            type="search"
            placeholder="Buscar por nombre"
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
          />
        </div>
      </div>

      <div className="card">
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
            {filteredRows.map((r) => (
              <tr key={r.id}>
                <td
                  style={{
                    fontWeight: 500,
                    color: "#0B2A4A",
                  }}
                >
                  {r.estudiante}
                </td>

                <td>{r.curso}</td>

                <td>{r.tipo}</td>

                <td>
                  <select
                    value={r.modalidad}
                    onChange={(e) => {
                      setRows((prev) =>
                        prev.map((item) =>
                          item.id === r.id
                            ? {
                                ...item,
                                modalidad:
                                  e.target.value as Modalidad,
                              }
                            : item,
                        ),
                      );
                    }}
                  >
                    {MODALIDAD_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td>{r.fecha}</td>

                <td>
                  <span className={"bs " + r.estadoPago}>
                    {r.estadoPago === "pendiente" &&
                      "Pendiente"}

                    {r.estadoPago === "parcial" &&
                      "Parcial"}

                    {r.estadoPago === "pagado" &&
                      "Pagado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}