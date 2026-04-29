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

  async function handleDelete(ci: string) {
    if (!confirm('¿Eliminar estudiante?')) return;

    try {
      await apiDelete(`/api/students/${ci}`);
      setList((prev) => prev.filter((e) => e.ci !== ci));
    } catch (error) {
      console.error(error);
      alert('Error al eliminar estudiante');
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
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 13, color: '#64748b' }}>Filtrar por admin:</label>
          <select
            value={adminFilter}
            onChange={(ev) => setAdminFilter(ev.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              backgroundColor: 'white',
            }}
          >
            <option value="">Todos los admins</option>
            {admins.map((admin) => (
              <option key={admin} value={admin}>
                {admin}
              </option>
            ))}
          </select>
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
          {rows.map((e, i) => (
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
                <button type="button" className="ab" onClick={() => handleDelete(e.ci)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
