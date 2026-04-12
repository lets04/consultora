import type { Estudiante } from '../../../types/student';

export function StudentPagosTab({ e }: { e: Estudiante }) {
  return (
    <div className="card">
      <div className="form-section-title" style={{ marginBottom: 12 }}>
        <span className="fs-icon">◈</span> Historial de pagos
      </div>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Comprobante</th>
          </tr>
        </thead>
        <tbody>
          {e.pagos && e.pagos.length > 0 ? (
            e.pagos.map((p, index) => (
              <tr key={index}>
                <td>{e.curso}</td>
                <td>Bs. {p.monto}</td>
                <td>{p.fecha}</td>
                <td>{p.tipoPago}</td>
                <td>{p.numeroComprobante ?? '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>
                No hay pagos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
