import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiDelete, apiGet } from '../../api/client';
import type { Estudiante } from '../../types/student';

export function EstudiantesGerentePage() {
  const [list, setList] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ ci: string; nombre: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    let cancelled = false;
    apiGet<Estudiante[]>('/api/students')
      .then((d) => {
        if (!cancelled) setList(d);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Obtener lista única de admins
  const admins = useMemo(() => {
    const adminSet = new Set<string>();
    list.forEach((e) => {
      if (e.adminEmail) adminSet.add(e.adminEmail);
    });
    return Array.from(adminSet).sort();
  }, [list]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    let result = list;
    if (s) {
      result = result.filter(
        (e) =>
          e.nombre.toLowerCase().includes(s) ||
          e.ci.includes(s) ||
          e.curso.toLowerCase().includes(s),
      );
    }
    if (adminFilter) {
      result = result.filter((e) => e.adminEmail === adminFilter);
    }
    return result;
  }, [q, list, adminFilter]);

  const total = list.length;
  const pend = list.filter((e) => e.pago === 'pendiente').length;

  if (loading) return <div className="empty-hint">Cargando estudiantes…</div>;
  if (err) return <div className="empty-hint">{err}</div>;

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/students/${pendingDelete.ci}`);
      setList((prev) => prev.filter((e) => e.ci !== pendingDelete.ci));
      setPendingDelete(null);
    } catch (error) {
      console.error(error);
      alert('Error al eliminar estudiante');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="sl">Total</div>
          <div className="sn blue">{total}</div>
        </div>
        <div className="stat-card">
          <div className="sl">Pago pendiente</div>
          <div className="sn amber">{pend}</div>
        </div>
        <div className="stat-card">
          <div className="sl">Admins activos</div>
          <div className="sn">{admins.length}</div>
        </div>
      </div>
      <div className="sec-header">
        <h2>Gestión de estudiantes</h2>
      </div>
      <div className="search-bar">
        <span style={{ color: '#94a3b8', fontSize: 13 }}>⌕</span>
        <input
          type="search"
          placeholder="Buscar por nombre, CI o curso..."
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
        />
      </div>
      {admins.length > 0 && (
        <div className="manager-filter-card">
          <div className="manager-filter-main">
            <div className="manager-filter-icon">◎</div>
            <div className="manager-filter-copy">
              <span className="manager-filter-label">Admin responsable</span>
              <span className="manager-filter-meta">
                {rows.length} de {total} estudiantes visibles
              </span>
            </div>
          </div>
          <div className="manager-filter-controls">
            <select
              value={adminFilter}
              onChange={(ev) => setAdminFilter(ev.target.value)}
              className="manager-admin-select"
            >
              <option value="">Todos los admins</option>
              {admins.map((admin) => (
                <option key={admin} value={admin}>
                  {admin}
                </option>
              ))}
            </select>
            {adminFilter && (
              <button
                type="button"
                className="btn-secondary btn-compact"
                onClick={() => setAdminFilter('')}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Curso actual</th>
            <th>Inscripción</th>
            <th>Pago</th>
            <th>Admin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, displayLimit).map((e, i) => (
            <tr key={e.ci}>
              <td style={{ color: '#94a3b8' }}>{String(i + 1).padStart(2, '0')}</td>
              <td>
                <span style={{ fontWeight: 500, color: '#0B2A4A' }}>{e.nombre}</span>
                <br />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>CI: {e.ci}</span>
              </td>
              <td>{e.curso}</td>
              <td>{e.inscripcion}</td>
              <td>
                <span className={'bs ' + e.pago}>{e.pago}</span>
              </td>
              <td>
                {e.adminEmail ? (
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {e.adminEmail}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>—</span>
                )}
              </td>
              <td>
                <Link to={`/estudiantes/ver/${encodeURIComponent(e.ci)}`} className="ab">
                  Ver
                </Link>
                <button type="button" className="ab" onClick={() => setPendingDelete({ ci: e.ci, nombre: e.nombre })}>
                  Eliminar
                </button>
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
