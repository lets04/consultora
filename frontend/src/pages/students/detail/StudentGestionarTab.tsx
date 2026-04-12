import type { Estudiante } from '../../../types/student';

export function StudentGestionarTab({ e }: { e: Estudiante }) {
  return (
    <div className="card">
      <div className="form-section-title" style={{ marginBottom: 14 }}>
        <span className="fs-icon">⚙</span> Gestionar estudiante
      </div>
      <div className="form-grid cols2" style={{ marginBottom: 14 }}>
        <div className="form-field">
          <label>Estado del estudiante</label>
          <select defaultValue={e.estado}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>
        <div className="form-field">
          <label>Estado de pago</label>
          <select defaultValue={e.pago}>
            <option value="pagado">Pagado</option>
            <option value="parcial">Pago parcial</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-primary">
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
