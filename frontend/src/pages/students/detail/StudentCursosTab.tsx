import type { Estudiante } from '../../../types/student';

export function StudentCursosTab({ e }: { e: Estudiante }) {
  return (
    <div className="card">
      <div className="form-section-title" style={{ marginBottom: 12 }}>
        <span className="fs-icon">✎</span> Cursos inscritos
      </div>
      <table>
        <thead>
          <tr>
            <th>Curso</th>
            <th>Área</th>
            <th>Modalidad</th>
            <th>Inicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {(e.cursos && e.cursos.length > 0 ? e.cursos : [{
            nombre: e.curso,
            area: 'General',
            modalidad: 'certificado',
            inicio: e.inscripcion,
            estado: 'activo',
          }]).map((curso) => (
            <tr key={`${curso.nombre}-${curso.inicio}`}>
              <td style={{ fontWeight: 500 }}>{curso.nombre}</td>
              <td>{curso.area}</td>
              <td>{curso.modalidad}</td>
              <td>{curso.inicio}</td>
              <td>
                <span className={`bs ${curso.estado}`}>{curso.estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
