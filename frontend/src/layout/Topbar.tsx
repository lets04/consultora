import { useAuth, useRole } from '../context/AuthContext';
import { ROLE_LABELS } from '../types/role';

export function Topbar({ title }: { title: string }) {
  const role = useRole();
  const { userName } = useAuth();
  const initials = (userName ?? '?').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11.5, color: '#64748b' }}>
          {userName} · {ROLE_LABELS[role]}
        </span>
        <div className={`avatar-circle ${role === 'admin' ? 'admin' : ''}`}>{initials}</div>
      </div>
    </header>
  );
}
