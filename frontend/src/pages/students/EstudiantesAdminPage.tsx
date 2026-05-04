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
  const [pendingDelete, setPendingDelete] = useState<{ ci: string; nombre: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
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

  if (loading) return <div className="empty-hint">Cargando estudiantes…</div>;
  if (err) return <div className="empty-hint">{err}</div>;

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/students/${pendingDelete.ci}`);
      setList((prev) => prev.filter((e) => e.ci !== pendingDelete.ci));
      setPendingDelete(null);
    } catch (e) {
      console.error(e);
      alert("Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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
            <th>Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, displayLimit).map((e, i) => (
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
              <td>{e.registro ?? e.inscripcion}</td>
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
                    onClick={() => setPendingDelete({ ci: e.ci, nombre: e.nombre })}
                  >
                    Eliminar
                  </button>
                )}
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

      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">!</div>
            <h3>Eliminar estudiante</h3>
            <p>
              ¿Está seguro que desea eliminar a <strong>{pendingDelete.nombre}</strong> (CI: {pendingDelete.ci})?
              <br /><br />
              Se borrarán todos sus datos e inscripciones. Esta acción no se puede deshacer.
            </p>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>
                Cancelar
              </button>
              <button type="button" className="btn-danger" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
