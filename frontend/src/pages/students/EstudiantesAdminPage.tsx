import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../api/client";
import type { Estudiante } from "../../types/student";
import { useRole } from "../../context/AuthContext";
import { apiDelete } from "../../api/client";

export function EstudiantesAdminPage() {
  const [list, setList] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const role = useRole();

  useEffect(() => {
    let cancelled = false;
    apiGet<Estudiante[]>("/api/students")
      .then((d) => {
        if (!cancelled) setList(d);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (e) =>
        e.nombre.toLowerCase().includes(s) ||
        e.ci.includes(s) ||
        e.curso.toLowerCase().includes(s),
    );
  }, [q, list]);

  const total = list.length;
  const activos = list.filter((e) => e.estado === "activo").length;
  const pend = list.filter((e) => e.pago === "pendiente").length;

  if (loading) return <div className="empty-hint">Cargando estudiantes…</div>;
  if (err) return <div className="empty-hint">{err}</div>;

  async function handleDelete(ci: string) {
    if (!confirm("¿Eliminar estudiante?")) return;

    try {
      await apiDelete(`/api/students/${ci}`);
      setList((prev) => prev.filter((e) => e.ci !== ci));
    } catch (e) {
      console.error(e);
      alert("Error al eliminar");
    }
  }
  
  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="sl">Total</div>
          <div className="sn blue">{total}</div>
        </div>
        <div className="stat-card">
          <div className="sl">Activos</div>
          <div className="sn green">{activos}</div>
        </div>
        <div className="stat-card">
          <div className="sl">Pago pendiente</div>
          <div className="sn amber">{pend}</div>
        </div>
        <div className="stat-card">
          <div className="sl">Nuevos mes</div>
          <div className="sn">—</div>
        </div>
      </div>
      <div className="sec-header">
        <h2>Lista de estudiantes</h2>
        <Link to="/estudiantes/nuevo" className="btn-primary">
          + Nuevo estudiante
        </Link>
      </div>
      <div className="search-bar">
        <span style={{ color: "#94a3b8", fontSize: 13 }}>⌕</span>
        <input
          type="search"
          placeholder="Buscar por nombre, CI o curso..."
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Curso</th>
            <th>Inscripción</th>
            <th>Estado pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <tr key={e.ci}>
              <td style={{ color: "#94a3b8" }}>
                {String(i + 1).padStart(2, "0")}
              </td>
              <td>
                <span style={{ fontWeight: 500, color: "#0B2A4A" }}>
                  {e.nombre}
                </span>
                <br />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  CI: {e.ci}
                </span>
              </td>
              <td>{e.curso}</td>
              <td>{e.inscripcion}</td>
              <td>
                <span className={"bs " + e.pago}>{e.pago}</span>
              </td>
              <td>
                <Link to={`/estudiantes/ver/${e.ci}`} className="ab">
                  Ver
                </Link>

                <Link to={`/estudiantes/editar/${e.ci}`} className="ab">
                  Editar
                </Link>

                {role === "gerente" && (
                  <button
                    type="button"
                    className="ab"
                    onClick={() => handleDelete(e.ci)}
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
