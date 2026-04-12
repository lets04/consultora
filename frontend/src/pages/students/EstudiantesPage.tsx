import { useRole } from '../../context/AuthContext';
import { EstudiantesAdminPage } from './EstudiantesAdminPage';
import { EstudiantesGerentePage } from './EstudiantesGerentePage';

export function EstudiantesPage() {
  const role = useRole();
  return role === 'admin' ? <EstudiantesAdminPage /> : <EstudiantesGerentePage />;
}
