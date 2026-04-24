import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useRole } from '../context/AuthContext';
import { ROLE_LABELS } from '../types/role';

function navClass({ isActive }: { isActive: boolean }) {
  return 'nav-item' + (isActive ? ' active' : '');
}

function subClass({ isActive }: { isActive: boolean }) {
  return 'sub-item' + (isActive ? ' active' : '');
}

export function Sidebar() {
  const role = useRole();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';

  function onLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">INNOVA</div>
        <div className="sub">{isAdmin ? 'Panel de administración' : 'Panel de gerencia'}</div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={navClass} end>
          <span className="ni">⊞</span>
          <span className="nl">Dashboard</span>
        </NavLink>
        <div className="nav-divider" />

        {isAdmin ? (
          <>
            <div className="nav-section-label">Gestión</div>
            <NavLink to="/estudiantes" className={navClass}>
              <span className="ni">◎</span>
              <span className="nl">Estudiantes</span>
            </NavLink>
            <NavLink to="/estudiantes/concluidos" className={subClass}>
              <span className="dot" />
              Estudiantes Concluidos
            </NavLink>
            <div className="nav-divider" />
            <NavLink to="/inscripciones" className={navClass}>
              <span className="ni">✎</span>
              <span className="nl">Inscripciones</span>
            </NavLink>
            <NavLink to="/inscripciones/nueva" className={subClass}>
              <span className="dot" />
              Nueva inscripción
            </NavLink>
            <NavLink to="/inscripciones/en-curso" className={subClass}>
              <span className="dot" />
              En curso
            </NavLink>
            <div className="nav-divider" />
            <NavLink to="/pagos/todos" className={navClass}>
              <span className="ni">◈</span>
              <span className="nl">Pagos</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="nav-section-label">Catálogo</div>
            <NavLink to="/promociones" className={navClass}>
              <span className="ni">★</span>
              <span className="nl">Promociones</span>
            </NavLink>
            <NavLink to="/areas" className={navClass}>
              <span className="ni">◈</span>
              <span className="nl">Áreas y cursos</span>
            </NavLink>
            <div className="nav-divider" />
            <div className="nav-section-label">Estudiantes</div>
            <NavLink to="/estudiantes" className={navClass}>
              <span className="ni">◎</span>
              <span className="nl">Gestión de estudiantes</span>
            </NavLink>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        {!isAdmin && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8, padding: '0 6px' }}>
            {ROLE_LABELS.gerente}
          </div>
        )}
        <button type="button" className="logout-btn" onClick={onLogout}>
          ⏻ Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
