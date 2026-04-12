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
        <span className="info-label">Fecha de inscripción</span>
        <span className="info-value">{e.inscripcion}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Estado de pago</span>
        <span className="info-value">
          <span className={'bs ' + e.pago}>{e.pago.charAt(0).toUpperCase() + e.pago.slice(1)}</span>
        </span>
      </div>
      <div className="info-row">
        <span className="info-label">Curso actual</span>
        <span className="info-value">{e.curso}</span>
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
