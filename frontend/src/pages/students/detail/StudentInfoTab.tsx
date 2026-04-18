import type { Estudiante } from '../../../types/student';

export function StudentInfoTab({ e }: { e: Estudiante }) {
  return (
    <div className="card">
      <div className="info-row">
        <span className="info-label">Nombre completo</span>
        <span className="info-value">{e.nombre}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Cédula de identidad</span>
        <span className="info-value">{e.ci}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Fecha de registro</span>
        <span className="info-value">{e.registro ?? e.inscripcion}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Teléfono</span>
        <span className="info-value">{e.telefono ?? 'Sin datos'}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Correo</span>
        <span className="info-value">{e.email ?? 'Sin datos'}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Departamento</span>
        <span className="info-value">{e.departamento ?? 'Sin datos'}</span>
      </div>
    </div>
  );
}
