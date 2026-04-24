import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../../api/client";
import { apiGet } from "../../api/client";
import { apiPut } from "../../api/client";
import { useParams } from "react-router-dom";


export function RegistrarEstudiantePage() {
  const { ci } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(ci);
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    ci: "",
    prefijo: "",
    nombres: "",
    apellidos: "",
    profesion: "",
    telefono: "",
    email: "",
    departamento: "",
  });

  const [errors, setErrors] = useState({
    ci: "",
    nombres: "",
    apellidos: "",
    email: "",
    departamento: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ci) return;

    apiGet(`/api/students/${ci}`).then((data: any) => {
      // Parsear nombre completo para separar nombres y apellidos
      const nombreCompleto = data.nombre || "";
      const partes = nombreCompleto.trim().split(" ");
      const primerosDos = partes.slice(0, 2).join(" ");
      const ultimos = partes.slice(2).join(" ");
      
      setForm({
        ci: data.ci || "",
        prefijo: data.prefijo || "",
        nombres: primerosDos,
        apellidos: ultimos,
        profesion: data.profesion || "",
        telefono: data.telefono || "",
        email: data.email || "",
        departamento: data.departamento || "",
      });
    });
  }, [ci]);

  function validate() {
    const newErrors = {
      ci: "",
      nombres: "",
      apellidos: "",
      email: "",
      departamento: "",
    };

    // CI solo números
    if (!/^\d+$/.test(form.ci)) {
      newErrors.ci = "Solo números";
    }

    if (!form.nombres) {
      newErrors.nombres = "Requerido";
    }

    if (!form.apellidos) {
      newErrors.apellidos = "Requerido";
    }

    // Email válido
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.departamento) {
      newErrors.departamento = "Selecciona un departamento";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((e) => e === "");
  }

  async function handleSave() {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await apiPut(`/api/students/${ci}`, form);
      } else {
        await apiPost("/api/students", form);
      }

      navigate("/estudiantes");
    } catch (e) {
      console.error(e);
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  // FORMULARIO DE EDICIÓN (un solo formulario)
  if (isEditing) {
    return (
      <>
        <div className="sec-header">
          <h2>Editar estudiante</h2>
          <Link to="/estudiantes" className="btn-secondary">
            ← Volver
          </Link>
        </div>

        <div className="card">
          <div className="form-section-title">
            <span className="fs-icon">◎</span> Datos personales
          </div>

          <div className="form-grid cols2">
            <div className="form-field">
              <label>CI *</label>
              <input
                placeholder="Número de cédula"
                value={form.ci}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, ci: value });
                }}
                disabled
                style={{ borderColor: errors.ci ? "red" : undefined }}
              />
              {errors.ci && <span className="error-text">{errors.ci}</span>}
            </div>

            <div className="form-field">
              <label>Prefijo</label>
              <input
                placeholder="Ej: Ing., Lic., Dr."
                value={form.prefijo}
                onChange={(e) =>
                  setForm({ ...form, prefijo: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label>Nombres *</label>
              <input
                placeholder="Nombres"
                value={form.nombres}
                onChange={(e) =>
                  setForm({ ...form, nombres: e.target.value })
                }
                style={{ borderColor: errors.nombres ? "red" : undefined }}
              />
              {errors.nombres && (
                <span className="error-text">{errors.nombres}</span>
              )}
            </div>

            <div className="form-field">
              <label>Apellidos *</label>
              <input
                placeholder="Apellidos del estudiante"
                value={form.apellidos}
                onChange={(e) =>
                  setForm({ ...form, apellidos: e.target.value })
                }
              />
            </div>

            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label>Profesión</label>
              <input
                placeholder="Profesión del estudiante"
                value={form.profesion}
                onChange={(e) =>
                  setForm({ ...form, profesion: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: 24 }}>
            <span className="fs-icon">✆</span> Datos de contacto
          </div>

          <div className="form-grid cols3">
            <div className="form-field">
              <label>Teléfono</label>
              <input
                placeholder="Número de teléfono"
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ borderColor: errors.email ? "red" : undefined }}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-field">
              <label>Departamento</label>
              <select
                value={form.departamento}
                onChange={(e) =>
                  setForm({ ...form, departamento: e.target.value })
                }
                style={{
                  borderColor: errors.departamento ? "red" : undefined,
                }}
              >
                <option value="">Seleccionar departamento</option>
                <option value="La Paz">La Paz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Tarija">Tarija</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
              </select>
              {errors.departamento && (
                <span className="error-text">{errors.departamento}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <Link to="/estudiantes" className="btn-secondary">
              Cancelar
            </Link>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </>
    );
  }

  // FORMULARIO DE REGISTRO (por pasos)
  return (
    <>
      <div className="sec-header">
        <h2>Registrar nuevo estudiante</h2>
        <Link to="/estudiantes" className="btn-secondary">
          ← Volver
        </Link>
      </div>

      {/* PROGRESO */}
      <div className="reg-progress">
        <div className={"reg-step" + (step === 1 ? " active" : "")}>
          <div className="reg-step-num">1</div>
          Datos personales
        </div>

        <div className="reg-step-sep" />

        <div className={"reg-step" + (step === 2 ? " active" : "")}>
          <div className="reg-step-num">2</div>
          Contacto
        </div>
      </div>

      <div className="card">
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="form-section-title">
              <span className="fs-icon">◎</span> Datos personales
            </div>

            <div className="form-grid cols2">
              <div className="form-field">
                <label>CI *</label>
                <input
                  placeholder="Número de cédula"
                  value={form.ci}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // solo números
                    setForm({ ...form, ci: value });
                  }}
                  style={{ borderColor: errors.ci ? "red" : undefined }}
                />
                {errors.ci && <span className="error-text">{errors.ci}</span>}
              </div>

              <div className="form-field">
                <label>Prefijo</label>
                <input
                  placeholder="Ej: Ing., Lic., Dr."
                  value={form.prefijo}
                  onChange={(e) =>
                    setForm({ ...form, prefijo: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>Nombres *</label>
                <input
                  placeholder="Nombres"
                  value={form.nombres}
                  onChange={(e) =>
                    setForm({ ...form, nombres: e.target.value })
                  }
                  style={{ borderColor: errors.nombres ? "red" : undefined }}
                />
                {errors.nombres && (
                  <span className="error-text">{errors.nombres}</span>
                )}
              </div>

              <div className="form-field">
                <label>Apellidos *</label>
                <input
                  placeholder="Apellidos del estudiante"
                  value={form.apellidos}
                  onChange={(e) =>
                    setForm({ ...form, apellidos: e.target.value })
                  }
                />
              </div>

              <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                <label>Profesión</label>
                <input
                  placeholder="Profesión del estudiante"
                  value={form.profesion}
                  onChange={(e) =>
                    setForm({ ...form, profesion: e.target.value })
                  }
                />
              </div>
            </div>

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

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="form-section-title">
              <span className="fs-icon">✆</span> Datos de contacto
            </div>

            <div className="form-grid cols3">
              <div className="form-field">
                <label>Teléfono *</label>
                <input
                  placeholder="Número de teléfono"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ borderColor: errors.email ? "red" : undefined }}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-field">
                <label>Departamento</label>
                <select
                  value={form.departamento}
                  onChange={(e) =>
                    setForm({ ...form, departamento: e.target.value })
                  }
                  style={{
                    borderColor: errors.departamento ? "red" : undefined,
                  }}
                >
                  <option>Seleccionar departamento</option>
                  <option value="La Paz">La Paz</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Oruro">Oruro</option>
                  <option value="Potosí">Potosí</option>
                  <option value="Chuquisaca">Chuquisaca</option>
                  <option value="Tarija">Tarija</option>
                  <option value="Beni">Beni</option>
                  <option value="Pando">Pando</option>
                </select>
                {errors.departamento && (
                  <span className="error-text">{errors.departamento}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
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
                onClick={handleSave}
              >
                Guardar estudiante
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
