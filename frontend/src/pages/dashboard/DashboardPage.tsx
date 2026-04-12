import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../api/client';
import { useRole } from '../../context/AuthContext';
import type { DashboardAdminDto, DashboardGerenteDto } from '../../types/api';

export function DashboardPage() {
  const role = useRole();
  const [admin, setAdmin] = useState<DashboardAdminDto | null>(null);
  const [gerente, setGerente] = useState<DashboardGerenteDto | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    const path = role === 'gerente' ? '/api/dashboard/gerente' : '/api/dashboard/admin';
    apiGet<DashboardAdminDto | DashboardGerenteDto>(path)
      .then((d) => {
        if (cancelled) return;
        if (role === 'gerente') setGerente(d as DashboardGerenteDto);
        else setAdmin(d as DashboardAdminDto);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Error al cargar');
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (err) {
    return <div className="empty-hint">{err}</div>;
  }

  if (role === 'gerente') {
    if (!gerente) return <div className="empty-hint">Cargando…</div>;
    return (
      <>
        <div className="stats-row">
          <div className="stat-card">
            <div className="sl">Estudiantes activos</div>
            <div className="sn green">{gerente.estudiantesActivos}</div>
          </div>
          <div className="stat-card">
            <div className="sl">Promoción actual</div>
            <div className="sn blue">Sem. {gerente.promocionSemana}</div>
          </div>
          <div className="stat-card">
            <div className="sl">Áreas activas</div>
            <div className="sn purple">{gerente.areasActivas}</div>
          </div>
          <div className="stat-card">
            <div className="sl">Cursos en catálogo</div>
            <div className="sn">{gerente.cursosCatalogo}</div>
          </div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="form-section-title">Promoción semana actual</div>
            {gerente.previewCursos.map((row) => (
              <div key={`${row.area}-${row.curso}`} className="pago-row">
                <span style={{ color: '#64748b', fontSize: 12 }}>{row.area}</span>
                <span style={{ color: '#334155', fontWeight: 500, fontSize: 12 }}>{row.curso}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <Link to="/promociones" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Gestionar promoción
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="form-section-title">Resumen de estudiantes</div>
            <div className="pago-row">
              <span style={{ color: '#64748b' }}>Total registrados</span>
              <span style={{ color: '#0B2A4A', fontWeight: 500 }}>{gerente.resumenEstudiantes.totalRegistrados}</span>
            </div>
            <div className="pago-row">
              <span style={{ color: '#64748b' }}>Con pago pendiente</span>
              <span style={{ color: '#dc2626', fontWeight: 500 }}>{gerente.resumenEstudiantes.pagoPendiente}</span>
            </div>
            <div className="pago-row">
              <span style={{ color: '#64748b' }}>Inscripciones activas</span>
              <span style={{ color: '#16a34a', fontWeight: 500 }}>{gerente.resumenEstudiantes.inscripcionesActivas}</span>
            </div>
            <div className="pago-row">
              <span style={{ color: '#64748b' }}>Nuevos este mes</span>
              <span style={{ color: '#2F5FD0', fontWeight: 500 }}>{gerente.resumenEstudiantes.nuevosMes}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <Link to="/estudiantes" className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                Ver estudiantes
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!admin) return <div className="empty-hint">Cargando…</div>;

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="sl">Total estudiantes</div>
          <div className="sn blue">{admin.totalEstudiantes}</div>
        </div>
        <div className="stat-card">
          <div className="sl">Activos</div>
          <div className="sn green">{admin.activos}</div>
        </div>
        <div className="stat-card">
          <div className="sl">Pago pendiente</div>
          <div className="sn amber">{admin.pagoPendiente}</div>
        </div>
        <div className="stat-card">
          <div className="sl">Nuevos este mes</div>
          <div className="sn">{admin.nuevosMes}</div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="form-section-title">Inscripciones recientes</div>
          {admin.inscripcionesRecientes.map((r, i) => (
            <div key={`${r.nombre}-${r.curso}-${i}`} className="pago-row">
              <span style={{ color: '#334155', fontWeight: 500 }}>{r.nombre}</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>{r.curso}</span>
              <span className={'bs ' + r.pago}>{r.pago}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="form-section-title">Resumen de pagos</div>
          <div className="pago-row">
            <span style={{ color: '#64748b' }}>Cobrado este mes</span>
            <span style={{ color: '#0B2A4A', fontWeight: 500 }}>
              Bs. {admin.cobradoMes.toLocaleString('es-BO')}
            </span>
          </div>
          <div className="pago-row">
            <span style={{ color: '#64748b' }}>Pendiente</span>
            <span style={{ color: '#dc2626', fontWeight: 500 }}>
              Bs. {admin.pendienteBs.toLocaleString('es-BO')}
            </span>
          </div>
          <div className="pago-row">
            <span style={{ color: '#64748b' }}>Parcial</span>
            <span style={{ color: '#b45309', fontWeight: 500 }}>
              Bs. {admin.parcialBs.toLocaleString('es-BO')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
