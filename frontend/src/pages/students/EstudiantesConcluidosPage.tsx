import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../api/client";
import type { EstudianteConcluidoDto } from "../../types/api";

type ModalidadFilter = "certificado" | "examen";

const MODALIDAD_OPTIONS: Array<{ value: ModalidadFilter; label: string }> = [
  { value: "certificado", label: "Certificado" },
  { value: "examen", label: "Examen" },
];

export function EstudiantesConcluidosPage() {
  const [list, setList] = useState<EstudianteConcluidoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<ModalidadFilter>("certificado");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const query = filtro ? `?modalidad=${encodeURIComponent(filtro)}` : "";
    apiGet<EstudianteConcluidoDto[]>(`/api/students/concluidos${query}`)
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error al cargar");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filtro]);

  const rows = useMemo(() => {
    const search = q.trim().toLowerCase();
    if (!search) return list;
    return list.filter(
      (item) =>
        item.nombre.toLowerCase().includes(search) ||
        item.ci.toLowerCase().includes(search) ||
        item.curso.toLowerCase().includes(search),
    );
  }, [q, list]);

  if (loading) {
    return <div className="empty-hint">Cargando estudiantes concluidos…</div>;
  }

  if (error) {
    return <div className="empty-hint">{error}</div>;
  }

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="sl">Total concluidos</div>
          <div className="sn blue">{rows.length}</div>
        </div>
      </div>

      <div className="sec-header">
        <h2>Estudiantes concluidos</h2>
      </div>

      <div className="filters-row" style={{ gap: 12, marginBottom: 16 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>⌕</span>
          <input
            type="search"
            placeholder="Buscar por nombre, CI o curso..."
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {MODALIDAD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-tab ${filtro === opt.value ? "active" : ""}`}
              onClick={() => setFiltro(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>CI</th>
            <th>Registro</th>
            <th>Modalidad</th>
            <th>Curso</th>
            {filtro !== "certificado" && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => (
            <tr key={`${item.id}-${item.ci}`}>
              <td style={{ color: "#94a3b8" }}>
                {String(index + 1).padStart(2, "0")}
              </td>

              <td>
                <span style={{ fontWeight: 500, color: "#0B2A4A" }}>
                  {item.nombre}
                </span>
              </td>

              <td>{item.ci}</td>
              <td>{item.registro}</td>

              <td>
                <span className={`bs ${item.modalidad}`}>{item.modalidad}</span>
              </td>

              <td>{item.curso}</td>

              {filtro !== "certificado" && (
                <td>
                  <Link
                    to={`/estudiantes/ver/${encodeURIComponent(item.ci)}`}
                    className="ab"
                  >
                    Agregar Nota
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
