import type { Estudiante } from "../../../types/student";

type Props = {
  e: Estudiante;
  mode?: "all" | "certificado" | "examen";
};

export function StudentCursosTab({ e, mode = "all" }: Props) {
  const baseCursos =
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

  const cursos =
    mode === "certificado"
      ? baseCursos.filter((c) => c.modalidad === "certificado")
      : mode === "examen"
        ? baseCursos.filter((c) => c.modalidad === "examen")
        : baseCursos;

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
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso) => (
            <tr key={`${curso.nombre}-${curso.inicio}-${curso.id}`}>
              <td>
                <span
                  className={`bs ${curso.tipo === "promocion" ? "info" : "success"}`}
                >
                  {curso.tipo === "promocion" ? "Promoción" : "Curso"}
                </span>
              </td>
              <td>{curso.nombre}</td>
              <td>{curso.area}</td>
              <td>{curso.modalidad}</td>
              <td>{curso.inicio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
