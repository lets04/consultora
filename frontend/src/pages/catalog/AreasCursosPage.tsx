import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api/client";
import type { AreaDto } from "../../types/api";

export function AreasCursosPage() {
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewArea, setShowNewArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaColor, setNewAreaColor] = useState("#2F5FD0");
  const [editingArea, setEditingArea] = useState<AreaDto | null>(null);
  const [newCursoName, setNewCursoName] = useState("");
  const [addingCursoTo, setAddingCursoTo] = useState<string | null>(null);
  const [filterArea, setFilterArea] = useState<string>("todas");

  const loadAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<AreaDto[]>("/api/areas");
      setAreas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleCreateArea = async () => {
    if (!newAreaName.trim()) return;
    try {
      await apiPost("/api/areas", {
        nombre: newAreaName.trim(),
        color: newAreaColor,
      });
      setNewAreaName("");
      setNewAreaColor("#2F5FD0");
      setShowNewArea(false);
      loadAreas();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const handleEditArea = async () => {
    if (!editingArea || !newAreaName.trim()) return;
    try {
      await apiPut(`/api/areas/${editingArea.id}`, {
        nombre: newAreaName.trim(),
        color: newAreaColor,
      });
      setEditingArea(null);
      setNewAreaName("");
      setNewAreaColor("#2F5FD0");
      loadAreas();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const handleDeleteArea = async (areaId: number) => {
    if (!confirm("¿Eliminar área?")) return;
    try {
      await apiDelete(`/api/areas/${areaId}`);
      loadAreas();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const handleAddCurso = async (areaId: number) => {
    if (!newCursoName.trim()) return;
    try {
      await apiPost("/api/cursos", { areaId, nombre: newCursoName.trim() });
      setNewCursoName("");
      setAddingCursoTo(null);
      loadAreas();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const areaOptions = [
    { id: "todas", label: "Todas", color: "#94a3b8" },
    ...areas.map((a) => ({
      id: a.nombre,
      label: a.nombre,
      color: a.color,
    })),
  ];

  const filteredAreas =
  filterArea === 'todas'
    ? areas
    : areas.filter((a) => a.nombre === filterArea);

  if (loading) return <div className="empty-hint">Cargando áreas…</div>;
  if (error) return <div className="empty-hint">{error}</div>;

  return (
    <>
      <div className="sec-header">
        <h2>Áreas y cursos</h2>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowNewArea(true)}
        >
          + Nueva área
        </button>
      </div>
      <div className="form-section-title" style={{ marginBottom: 10 }}>
        <span className="fs-icon">◈</span> Filtrar por área
      </div>

      <div className="area-tabs" style={{ marginBottom: 16 }}>
        {areaOptions.map((a) => (
          <button
            key={a.id}
            type="button"
            className={"area-tab" + (filterArea === a.id ? " active" : "")}
            onClick={() => setFilterArea(a.id)}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: a.color,
              }}
            />
            {a.label}
          </button>
        ))}
      </div>
      {showNewArea && (
        <div className="modal-overlay" onClick={() => setShowNewArea(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva área</h3>
            <div className="form-field">
              <label>Nombre</label>
              <input
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Color</label>
              <input
                type="color"
                value={newAreaColor}
                onChange={(e) => setNewAreaColor(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowNewArea(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCreateArea}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {editingArea && (
        <div className="modal-overlay" onClick={() => setEditingArea(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar área</h3>
            <div className="form-field">
              <label>Nombre</label>
              <input
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Color</label>
              <input
                type="color"
                value={newAreaColor}
                onChange={(e) => setNewAreaColor(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditingArea(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleEditArea}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredAreas.map((sec) => (
        <div key={sec.id} className="card" style={{ marginBottom: 12 }}>
          <div className="area-section-header">
            <div className="area-section-name">
              <span
                className="area-color-dot"
                style={{ background: sec.color }}
              />
              {sec.nombre}
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
                ({sec.cursos.length} cursos)
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ab"
                onClick={() => setAddingCursoTo(sec.id.toString())}
              >
                + Curso
              </button>
              <button
                type="button"
                className="ab"
                onClick={() => {
                  setEditingArea(sec);
                  setNewAreaName(sec.nombre);
                  setNewAreaColor(sec.color);
                }}
              >
                Editar área
              </button>
              <button
                type="button"
                className="ab"
                onClick={() => handleDeleteArea(sec.id)}
              >
                Eliminar área
              </button>
            </div>
          </div>
          {addingCursoTo === sec.id.toString() && (
            <div style={{ marginBottom: 12 }}>
              <input
                placeholder="Nombre del curso"
                value={newCursoName}
                onChange={(e) => setNewCursoName(e.target.value)}
              />
              <button type="button" onClick={() => handleAddCurso(sec.id)}>
                Agregar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingCursoTo(null);
                  setNewCursoName("");
                }}
              >
                Cancelar
              </button>
            </div>
          )}
          {sec.cursos.map((curso) => (
            <div key={curso.id} className="course-row">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: sec.color,
                  flexShrink: 0,
                }}
              />
              <span className="cr-name">{curso.nombre}</span>
              <span className="cr-hrs">—</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button type="button" className="ab">
                  Editar
                </button>
                <button type="button" className="ab">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
