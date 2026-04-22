import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiGet } from '../../api/client';
import type { Estudiante } from '../../types/student';
import { StudentCursosTab } from './detail/StudentCursosTab';
import { StudentInfoTab } from './detail/StudentInfoTab';
import { StudentNotasTab } from './detail/StudentNotasTab';

type Tab = 'info' | 'cursos' | 'notas' ;

export function StudentDetailPage() {
  const { ci } = useParams<{ ci: string }>();
  const [searchParams] = useSearchParams();
  const isConcluido = searchParams.get('from') === 'concluidos';
  const [e, setE] = useState<Estudiante | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>(isConcluido ? 'notas' : 'info');

  useEffect(() => {
    if (!ci) {
      setE(null);
      return;
    }
    let cancelled = false;
    setE(undefined);
    apiGet<Estudiante>(`/api/students/${encodeURIComponent(ci)}`)
      .then((data) => {
        if (!cancelled) setE(data);
      })
      .catch(() => {
        if (!cancelled) setE(null);
      });
    return () => {
      cancelled = true;
    };
  }, [ci]);

  if (e === undefined) {
    return <div className="empty-hint">Cargando…</div>;
  }

  if (!e) {
    return (
      <div className="empty-hint">
        Estudiante no encontrado.{' '}
        <Link to="/estudiantes" className="btn-secondary">
          Volver
        </Link>
      </div>
    );
  }

  const initials = e.nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="sec-header">
        <h2></h2>
        <Link to="/estudiantes" className="btn-secondary">
          ← Volver
        </Link>
      </div>
      <div className="student-profile">
        <div className="student-avatar">{initials}</div>
        <div>
          <div className="student-name">{e.nombre}</div>
          <div className="student-ci">CI: {e.ci}</div>
        </div>
      </div>
      <div className="detail-tabs">
        {isConcluido ? (
          [
            ['notas', 'Notas'],
            ['cursos', 'Cursos'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={'detail-tab' + (tab === id ? ' active' : '')}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        )) : (
          [
            ['info', 'Información'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={'detail-tab' + (tab === id ? ' active' : '')}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'info' && <StudentInfoTab e={e} />}
      {isConcluido && tab === 'cursos' && <StudentCursosTab e={e} />}
      {isConcluido && tab === 'notas' && <StudentNotasTab e={e} />}
    </>
  );
}
