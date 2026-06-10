import { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  function onLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <aside className={'sidebar' + (menuOpen ? ' menu-open' : '')}>
      <div className="sidebar-logo">
        <div>
          <div className="brand">INNV Ed.</div>
          <div className="sub">{isAdmin ? 'Panel de administración' : 'Panel de gerencia'}</div>
        </div>
        <button
          type="button"
          className="sidebar-menu-toggle"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={navClass} end onClick={closeMenu}>
          <span className="ni">⊞</span>
          <span className="nl">Dashboard</span>
        </NavLink>
        <div className="nav-divider" />

        {isAdmin ? (
          <>
            <div className="nav-section-label">Gestión</div>
            <NavLink to="/estudiantes" className={navClass} onClick={closeMenu}>
              <span className="ni">◎</span>
              <span className="nl">Estudiantes</span>
            </NavLink>
            <NavLink to="/estudiantes/concluidos" className={subClass} onClick={closeMenu}>
              <span className="dot" />
              Estudiantes Concluidos
            </NavLink>
            <div className="nav-divider" />
            <NavLink to="/inscripciones" className={navClass} onClick={closeMenu}>
              <span className="ni">✎</span>
              <span className="nl">Inscripciones</span>
            </NavLink>
            <NavLink to="/inscripciones/nueva" className={subClass} onClick={closeMenu}>
              <span className="dot" />
              Nueva inscripción
            </NavLink>
            <div className="nav-divider" />
            <NavLink to="/pagos/todos" className={navClass} onClick={closeMenu}>
              <span className="ni">◈</span>
              <span className="nl">Pagos</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="nav-section-label">Catálogo</div>
            <NavLink to="/promociones" className={navClass} onClick={closeMenu}>
              <span className="ni">★</span>
              <span className="nl">Promociones</span>
            </NavLink>
            <NavLink to="/areas" className={navClass} onClick={closeMenu}>
              <span className="ni">◈</span>
              <span className="nl">Áreas y cursos</span>
            </NavLink>
            
            <div className="nav-divider" />
            <div className="nav-section-label">Estudiantes</div>
            <NavLink to="/estudiantes" className={navClass} onClick={closeMenu}>
              <span className="ni">◎</span>
              <span className="nl">Gestión de estudiantes</span>
            </NavLink>
            <div className="nav-divider" />
            <div className="nav-section-label">Sistema</div>
            <NavLink to="/administradores" className={navClass} onClick={closeMenu}>
              <span className="ni">⚙</span>
              <span className="nl">Gestión de admins</span>
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
