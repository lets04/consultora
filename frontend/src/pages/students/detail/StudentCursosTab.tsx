import type { Estudiante } from "../../../types/student";

export function StudentCursosTab({ e }: { e: Estudiante }) {
  const cursos =
    e.cursos && e.cursos.length > 0
      ? e.cursos
      : [
          {
            id: 0,
            nombre: e.curso,
            area: "General",
            modalidad: "certificado",
            inicio: e.inscripcion,
            estado: "activo",
            tipo: "curso",
            nombrePromocion: undefined,
          },
        ];

  return (
    <div className="card">
      <div className="form-section-title" style={{ marginBottom: 12 }}>
        <span className="fs-icon">✎</span> Inscripciones
      </div>

      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Nombre</th>
            <th>Área</th>
            <th>Modalidad</th>
            <th>Inicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso) => (
            <tr key={`${curso.nombre}-${curso.inicio}-${curso.id}`}>
              <td>
                <span className={`bs ${curso.tipo === "promocion" ? "info" : "success"}`}>
                  {curso.tipo === "promocion" ? "Promoción" : "Curso"}
                </span>
              </td>
              <td>{curso.nombre}</td>
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
