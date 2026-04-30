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
  const [editingCurso, setEditingCurso] = useState<{ id: number; nombre: string } | null>(null);
  const [editingCursoName, setEditingCursoName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<
    | { type: "area"; id: number; name: string }
    | { type: "curso"; id: number; name: string }
    | null
  >(null);
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
    try {
      await apiDelete(`/api/areas/${areaId}`);
      setPendingDelete(null);
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

  const handleEditCurso = async () => {
    if (!editingCurso || !editingCursoName.trim()) return;
    try {
      await apiPut(`/api/cursos/${editingCurso.id}`, {
        nombre: editingCursoName.trim(),
      });
      setEditingCurso(null);
      setEditingCursoName("");
      loadAreas();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const handleDeleteCurso = async (cursoId: number) => {
    try {
      await apiDelete(`/api/cursos/${cursoId}`);
      setPendingDelete(null);
      loadAreas();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "area") {
      handleDeleteArea(pendingDelete.id);
      return;
    }
    handleDeleteCurso(pendingDelete.id);
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
        <div>
          <h2>Áreas y cursos</h2>
          <div className="catalog-subtitle">
            Organiza el catálogo, edita cursos y mantén cada área al día.
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowNewArea(true)}
        >
          + Nueva área
        </button>
      </div>
      <div className="catalog-toolbar">
        <div>
          <div className="form-section-title catalog-filter-title">
            <span className="fs-icon">◈</span> Filtrar por área
          </div>
          <div className="area-tabs catalog-tabs">
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
        </div>
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

      {editingCurso && (
        <div className="modal-overlay" onClick={() => setEditingCurso(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar curso</h3>
            <div className="form-field">
              <label>Nombre</label>
              <input
                value={editingCursoName}
                onChange={(e) => setEditingCursoName(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingCurso(null);
                  setEditingCursoName("");
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleEditCurso}
                disabled={!editingCursoName.trim()}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">!</div>
            <h3>
              Eliminar {pendingDelete.type === "area" ? "área" : "curso"}
            </h3>
            <p>
              Esta seguro que desea eliminar{" "}
              <strong>{pendingDelete.name}</strong>
              {pendingDelete.type === "area"
                ? ", esta acción no se podrá ejecutar si tiene cursos con inscripciones"
                : ", esta acción no se podrá ejecutar si el curso ya tiene inscripciones."}
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredAreas.map((sec) => (
        <div key={sec.id} className="card catalog-area-card">
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
            <div className="catalog-area-actions">
              <button
                type="button"
                className="btn-secondary btn-compact"
                onClick={() => setAddingCursoTo(sec.id.toString())}
              >
                + Curso
              </button>
              <button
                type="button"
                className="btn-secondary btn-compact"
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
                className="btn-danger btn-compact"
                onClick={() =>
                  setPendingDelete({ type: "area", id: sec.id, name: sec.nombre })
                }
              >
                Eliminar área
              </button>
            </div>
          </div>
          {addingCursoTo === sec.id.toString() && (
            <div className="catalog-inline-form">
              <input
                placeholder="Nombre del curso"
                value={newCursoName}
                onChange={(e) => setNewCursoName(e.target.value)}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleAddCurso(sec.id)}
                disabled={!newCursoName.trim()}
              >
                Agregar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setAddingCursoTo(null);
                  setNewCursoName("");
                }}
              >
                Cancelar
              </button>
            </div>
          )}
          <div className="catalog-course-list">
            {sec.cursos.length === 0 && (
              <div className="catalog-empty-course">Esta área todavía no tiene cursos.</div>
            )}
            {sec.cursos.map((curso) => (
              <div key={curso.id} className="course-row catalog-course-row">
                <span
                  className="catalog-course-dot"
                  style={{ background: sec.color }}
                />
                <span className="cr-name">{curso.nombre}</span>
                <div className="catalog-course-actions">
                  <button
                    type="button"
                    className="ab"
                    onClick={() => {
                      setEditingCurso(curso);
                      setEditingCursoName(curso.nombre);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ab danger"
                    onClick={() =>
                      setPendingDelete({
                        type: "curso",
                        id: curso.id,
                        name: curso.nombre,
                      })
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
