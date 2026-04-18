import { useState } from "react";
import { apiPut } from "../../../api/client";
import type { Estudiante } from "../../../types/student";

export function StudentNotasTab({ e }: { e: Estudiante }) {
  // Filtrar solo cursos con examen
  const cursosExamen = e.cursos?.filter((c) => c.modalidad === "examen") ?? [];

  const [notas, setNotas] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (key: string, value: number) => {
    setNotas((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const promises = cursosExamen.map(async (curso) => {
        const key = `${curso.nombre}-${curso.inicio}`;
        const nota = notas[key] ?? curso.nota ?? "";

        if (nota !== (curso.nota ?? 0)) {
          await apiPut("/api/inscriptions/nota", { id: curso.id, nota });
        }
      });

      await Promise.all(promises);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="form-section-title" style={{ marginBottom: 12 }}>
        <span className="fs-icon">📝</span> Notas
      </div>

      {cursosExamen.length === 0 ? (
        <p style={{ color: "#64748b" }}>No hay cursos con modalidad examen.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Nota</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cursosExamen.map((curso) => {
                const key = `${curso.nombre}-${curso.inicio}`;
                const nota = notas[key] ?? curso.nota ?? "";
                const isInvalid = nota > 100 || nota < 0;

                return (
                  <tr key={key}>
                    <td>{curso.nombre}</td>

                    <td>
                      <input
                        type="text"
                        value={nota}
                        inputMode="numeric"
                        onChange={(e) => {
                          let value = e.target.value;

                          // permitir vacío
                          if (value === "") {
                            handleChange(key, "" as any);
                            return;
                          }

                          // solo números
                          if (!/^\d+$/.test(value)) return;

                          // quitar ceros a la izquierda
                          value = String(Number(value));

                          let num = Number(value);

                          if (num > 100) num = 100;

                          handleChange(key, num);
                        }}
                        className={`input-nota 
    ${nota >= 51 ? "aprobado" : "reprobado"} 
    ${isInvalid ? "error" : ""}
  `}
                      />
                    </td>

                    <td>
                      {nota >= 51 ? (
                        <span className="bs success">Aprobado</span>
                      ) : (
                        <span className="bs danger">Reprobado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : success
                  ? "✔ Guardado"
                  : "Guardar Notas"}
            </button>

            {success && (
              <div className="success-banner">
                ✔ Notas guardadas correctamente
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
