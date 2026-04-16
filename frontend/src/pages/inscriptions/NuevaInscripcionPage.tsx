import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";
import type { AreaDto, PromotionDto } from "../../types/api";
import type { Estudiante } from "../../types/student";

export function NuevaInscripcionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [tipo, setTipo] = useState<"individual" | "promocion">("individual");
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [promocionId, setPromocionId] = useState<number | null>(null);
  const [modalidad, setModalidad] = useState<"certificado" | "examen">(
    "certificado",
  );
  const [montoTotal, setMontoTotal] = useState("");
  const [studentCi, setStudentCi] = useState("");
  const [cursosPromocion, setCursosPromocion] = useState<number[]>([]);
  const [promoCursosDisponibles, setPromoCursosDisponibles] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [areaId, setAreaId] = useState<number | null>(null);

  useEffect(() => {
    if (!promocionId) {
      setPromoCursosDisponibles([]);
      return;
    }

    const promo = promotions.find((p) => p.id === promocionId);
    console.log("promocionId:", promocionId);
    console.log("promo encontrado:", promo);
    console.log("promo?.cursos:", promo?.cursos);

    setPromoCursosDisponibles(promo?.cursos ?? []);
  }, [promocionId, promotions]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiGet<Estudiante[]>("/api/students"),
      apiGet<AreaDto[]>("/api/areas"),
      apiGet<PromotionDto[]>("/api/promotions"),
    ])
      .then(([studentsData, areaData, promotionData]) => {
        if (cancelled) return;
        setStudents(studentsData);
        setAreas(areaData);
        setPromotions(promotionData);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Error al cargar datos",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const filter = studentQuery.trim().toLowerCase();
    if (!filter) return students;
    return students.filter((student) =>
      [student.nombre, student.ci].join(" ").toLowerCase().includes(filter),
    );
  }, [studentQuery, students]);

  const availableCourses = useMemo(() => {
    if (!areaId) return [];

    const area = areas.find((a) => a.id === areaId);

    return area?.cursos ?? [];
  }, [areaId, areas]);

  async function handleSubmit() {
    setError(null);
    if (!studentCi) {
      setError("Selecciona un estudiante");
      return;
    }
    if (tipo === "individual" && !cursoId) {
      setError("Selecciona un curso");
      return;
    }
    if (tipo === "promocion" && !promocionId) {
      setError("Selecciona una promoción");
      return;
    }
    const monto = Number(montoTotal);
    if (!monto || monto <= 0) {
      setError("Ingresa un monto total válido");
      return;
    }
    if (tipo === "promocion" && cursosPromocion.length === 0) {
      setError("Selecciona al menos un curso de la promoción");
      return;
    }
    if (tipo === "individual" && !areaId) {
      setError("Selecciona un área");
      return;
    }
    setSaving(true);

    try {
      await apiPost("/api/inscriptions", {
        studentCi,
        tipo,
        cursoId: tipo === "individual" ? cursoId : undefined,
        promocionId: tipo === "promocion" ? promocionId : undefined,
        cursosSeleccionados: cursosPromocion,
        modalidad,
        montoTotal: monto,
      });

      navigate("/inscripciones");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear inscripción",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="empty-hint">Cargando formulario...</div>;
  }

  console.log("areas:", areas);
  console.log("promotions:", promotions);
  console.log("cursosPromocion:", cursosPromocion);

  return (
    <>
      <div className="sec-header">
        <h2>Nueva inscripción</h2>
        <Link to="/inscripciones" className="btn-secondary">
          ← Volver
        </Link>
      </div>

      {error && (
        <div className="empty-hint" style={{ color: "#c2410c" }}>
          {error}
        </div>
      )}

      <div className="step-indicator">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <span
              className={"step-dot " + (step === n ? "current" : "pending")}
            >
              {n}
            </span>
            <span className={"step-label" + (step === n ? " current" : "")}>
              {
                [
                  "Estudiante",
                  "Tipo",
                  tipo === "individual" ? "Curso" : "Promoción",
                  "Pago",
                ][n - 1]
              }
            </span>
            {n < 4 && (
              <span
                style={{
                  width: 16,
                  height: 1,
                  background: "#dde3ea",
                  margin: "0 4px",
                }}
              />
            )}
          </span>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <>
            <div className="form-section-title">Selecciona el estudiante</div>

            <div className="form-field">
              <label>Buscar</label>
              <input
                placeholder="CI o nombre"
                value={studentQuery}
                onChange={(event) => setStudentQuery(event.target.value)}
              />
            </div>

            <div className="student-results">
              {filteredStudents.length === 0 && (
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  No se encontraron estudiantes
                </div>
              )}

              {filteredStudents.slice(0, 5).map((student) => (
                <div
                  key={student.ci}
                  className={`student-item ${studentCi === student.ci ? "selected" : ""}`}
                  onClick={() => setStudentCi(student.ci)}
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    marginBottom: 6,
                    cursor: "pointer",
                    background: studentCi === student.ci ? "#eef3ff" : "white",
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{student.nombre}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    CI: {student.ci}
                  </div>
                </div>
              ))}
            </div>

            {studentCi && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: "#f8fafc",
                  borderRadius: 6,
                  fontSize: 13,
                }}
              >
                Seleccionado:{" "}
                <strong>
                  {students.find((s) => s.ci === studentCi)?.nombre}
                </strong>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(2)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-section-title">Tipo de inscripción</div>
            <div className="tipo-selector">
              <button
                type="button"
                className={
                  tipo === "individual" ? "tipo-card selected" : "tipo-card"
                }
                onClick={() => setTipo("individual")}
              >
                <div style={{ fontSize: 18, marginBottom: 7 }}>◎</div>
                <div
                  style={{ fontSize: 13, fontWeight: 500, color: "#0B2A4A" }}
                >
                  Curso individual
                </div>
                <div style={{ fontSize: 11.5, color: "#64748b" }}>
                  Inscribe a un estudiante en un curso.
                </div>
              </button>
              <button
                type="button"
                className={
                  tipo === "promocion" ? "tipo-card selected" : "tipo-card"
                }
                onClick={() => setTipo("promocion")}
              >
                <div style={{ fontSize: 18, marginBottom: 7 }}>★</div>
                <div
                  style={{ fontSize: 13, fontWeight: 500, color: "#0B2A4A" }}
                >
                  Promoción
                </div>
                <div style={{ fontSize: 11.5, color: "#64748b" }}>
                  Inscripción con un paquete de cursos.
                </div>
              </button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(3)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="form-section-title">
              Selecciona {tipo === "individual" ? "curso" : "promoción"}
            </div>

            {tipo === "individual" ? (
              <>
                {/* AREA */}
                <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Área</label>
                  <select
                    value={areaId ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value) || null;
                      setAreaId(id);
                      setCursoId(null); // reset curso al cambiar área
                    }}
                  >
                    <option value="">Selecciona un área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CURSO */}
                {areaId && (
                  <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Curso</label>
                    <select
                      value={cursoId ?? ""}
                      onChange={(event) =>
                        setCursoId(Number(event.target.value) || null)
                      }
                    >
                      <option value="">Selecciona un curso</option>
                      {availableCourses?.map((curso) => (
                        <option key={curso?.id} value={curso?.id}>
                          {curso?.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* SELECT PROMOCIÓN */}
                <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Promoción</label>
                  <select
                    value={promocionId ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value) || null;
                      setPromocionId(id);
                      setCursosPromocion([]);
                    }}
                  >
                    <option value="">Selecciona una promoción</option>
                    {promotions.map((promo) => (
                      <option key={promo.id} value={promo.id}>
                        {promo.titulo} — {promo.periodo}
                      </option>
                    ))}
                  </select>
                </div>

                {/*CURSOS */}
                {promocionId && (
                  <div className="card" style={{ marginTop: 12 }}>
                    <div className="form-section-title">
                      Seleccionar cursos de la promoción
                    </div>

                    {promoCursosDisponibles
                      .filter((curso) => curso && curso.id != null)
                      .map((curso) => {
                        console.log("CURSO DEBUG:", curso);
                        console.log("curso.id:", curso.id, typeof curso.id);

                        return (
                          <label
                            key={`curso-${curso.id}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 10px",
                              border: "1px solid #e2e8f0",
                              borderRadius: 6,
                              marginBottom: 6,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={cursosPromocion.includes(
                                Number(curso.id),
                              )}
                              onChange={() => {
                                const id = Number(curso.id);

                                console.log("CLICK curso:", curso);
                                console.log("ID enviado:", id);

                                setCursosPromocion((prev) =>
                                  prev.includes(id)
                                    ? prev.filter((c) => c !== id)
                                    : [...prev, id],
                                );
                              }}
                            />
                            <span>{curso.nombre ?? "Curso sin nombre"}</span>
                          </label>
                        );
                      })}

                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {cursosPromocion.length} de{" "}
                      {promoCursosDisponibles.length} cursos seleccionados
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(2)}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(4)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="form-section-title">Pago y modalidad</div>
            <div className="form-grid cols2">
              <div className="form-field">
                <label>Modalidad</label>
                <select
                  value={modalidad}
                  onChange={(event) =>
                    setModalidad(event.target.value as "certificado" | "examen")
                  }
                >
                  <option value="certificado">Certificado</option>
                  <option value="examen">Examen</option>
                </select>
              </div>
              <div className="form-field">
                <label>Monto total</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej. 1200"
                  value={montoTotal}
                  onChange={(event) => setMontoTotal(event.target.value)}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(3)}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Guardando…" : "Registrar inscripción"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
