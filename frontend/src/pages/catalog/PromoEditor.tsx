import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut } from "../../api/client";
import type { AreaDto, PromotionDto } from "../../types/api";

interface PromoEditorProps {
  promotion?: PromotionDto | null;
  onBack: () => void;
  onSave: () => void;
}

export function PromoEditor({ promotion, onBack, onSave }: PromoEditorProps) {
  const isEditing = Boolean(promotion);
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [titulo, setTitulo] = useState(promotion?.titulo ?? "");
  const [area, setArea] = useState<string>("todas");
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(promotion?.cursos.map((curso) => curso.id) ?? []),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<AreaDto[]>("/api/areas")
      .then((data) => {
        if (!cancelled) setAreas(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allCursos = useMemo(() => {
    const cursos: { id: number; name: string; area: string }[] = [];
    for (const a of areas) {
      for (const c of a.cursos) {
        cursos.push({ id: c.id, name: c.nombre, area: a.nombre });
      }
    }
    return cursos;
  }, [areas]);

  const filtered = useMemo(
    () =>
      area === "todas" ? allCursos : allCursos.filter((c) => c.area === area),
    [area, allCursos],
  );

  const areaOptions = useMemo(
    () => [
      { id: "todas", label: "Todas", color: "#94a3b8" },
      ...areas.map((a) => ({ id: a.nombre, label: a.nombre, color: a.color })),
    ],
    [areas],
  );

  const selectedCursos = useMemo(
    () => allCursos.filter((curso) => selected.has(curso.id)),
    [allCursos, selected],
  );

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    if (selected.size === 0 || !titulo.trim()) return;

    setSaving(true);
    try {
      const body = {
        titulo: titulo.trim(),
        cursos: Array.from(selected),
      };

      if (promotion) {
        await apiPut(`/api/promotions/${promotion.id}`, body);
      } else {
        await apiPost("/api/promotions", body);
      }

      onSave();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-hint">Cargando áreas…</div>;
  if (error) return <div className="empty-hint">{error}</div>;

  return (
    <>
      <div className="promo-week-header">
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#0B2A4A" }}>
            {isEditing ? "Editar promoción" : "Nueva promoción"}
          </div>
          <div style={{ fontSize: 11.5, color: "#64748b" }}>
            {isEditing
              ? "Modifica los cursos seleccionados o agrega cursos desde el filtro"
              : "Selecciona los cursos para la promoción de cualquier área"}
          </div>
        </div>

        <span
          style={{
            background: "#2F5FD0",
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            padding: "3px 10px",
            borderRadius: 20,
          }}
        >
          {selected.size} cursos
        </span>
      </div>

      {/* 👇 BOTONES ARRIBA */}
      <div className="form-actions" style={{ margin: "12px 0" }}>
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Volver
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={selected.size === 0 || !titulo.trim() || saving}
        >
          {saving
            ? "Guardando…"
            : isEditing
              ? "Guardar cambios"
              : "Guardar promoción"}
        </button>
      </div>

      <div className="card">
        <div className="form-grid cols2" style={{ marginBottom: 16 }}>
          <div className="form-field">
            <label>Nombre de la promoción</label>
            <input
              placeholder=""
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
        </div>
        <div className="form-section-title" style={{ marginBottom: 12 }}>
          Cursos seleccionados
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 16,
          }}
        >
          {selectedCursos.length === 0 ? (
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Todavía no hay cursos seleccionados.
            </span>
          ) : (
            selectedCursos.map((curso) => (
              <button
                key={curso.id}
                type="button"
                className="promo-chip"
                onClick={() => toggle(curso.id)}
              >
                {curso.name} ×
              </button>
            ))
          )}
        </div>
        <div className="form-section-title" style={{ marginBottom: 12 }}>
          <span className="fs-icon">◈</span> Filtrar por área
        </div>
        <div className="area-tabs">
          {areaOptions.map((a) => (
            <button
              key={a.id}
              type="button"
              className={"area-tab" + (area === a.id ? " active" : "")}
              onClick={() => setArea(a.id)}
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
        <div className="course-grid">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className={
                "course-item" + (selected.has(c.id) ? " selected" : "")
              }
              onClick={() => toggle(c.id)}
            >
              <input type="checkbox" readOnly checked={selected.has(c.id)} />
              <span className="ci-name">{c.name}</span>
              <span className="ci-area">{c.area}</span>
            </button>
          ))}
        </div>
        
      </div>
    </>
  );
}
