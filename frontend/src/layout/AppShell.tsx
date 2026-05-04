import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/promociones': 'Promociones semanales',
  '/areas': 'Áreas y cursos',
  '/estudiantes': 'Estudiantes',
  '/estudiantes/nuevo': 'Registrar nuevo estudiante',
  '/inscripciones': 'Inscripciones',
  '/inscripciones/nueva': 'Nueva inscripción',
  '/pagos/todos': 'Todos los pagos',
  '/pagos/pendientes': 'Pagos pendientes',
  '/pagos/parciales': 'Pagos parciales',
  '/pagos/pagados': 'Pagos completados',
};

export function AppShell() {
  const { pathname } = useLocation();
  const title =
    TITLES[pathname] ??
    (pathname.startsWith('/estudiantes/ver') ? 'Detalle del estudiante' : 'INNOVA');

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Topbar title={title} />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
