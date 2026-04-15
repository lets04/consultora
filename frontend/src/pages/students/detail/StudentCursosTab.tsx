import type { Estudiante } from "../../../types/student";

export function StudentCursosTab({ e }: { e: Estudiante }) {
  const cursos =
    e.cursos && e.cursos.length > 0
      ? e.cursos
      : [
          {
            nombre: e.curso,
            area: "General",
            modalidad: "certificado",
            inicio: e.inscripcion,
            estado: "activo",
            tipo: "curso",
            nombrePromocion: undefined,
          },
        ];
  const esPromocion = e.tipoInscripcion === "promocion";

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
             {!esPromocion && <th>Área</th>}
            <th>Modalidad</th>
            <th>Inicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {esPromocion ? (
            <tr>
              <td>
                <span className="bs info">Promoción</span>
              </td>
              <td style={{ fontWeight: 500 }}>
                {e.promocionNombre}
              </td>
              <td>{cursos[0]?.modalidad}</td>
              
              <td>{e.inscripcion}</td>
              <td>
                <span className="bs activo">activo</span>
              </td>
            </tr>
          ) : (
            cursos.map((curso) => (
              <tr key={`${curso.nombre}-${curso.inicio}`}>
                <td>
                  <span className="bs success">Curso</span>
                </td>
                <td>{curso.nombre}</td>
                <td>{curso.area}</td>
                <td>{curso.modalidad}</td>
                <td>{curso.inicio}</td>
                <td>
                  <span className={`bs ${curso.estado}`}>{curso.estado}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
