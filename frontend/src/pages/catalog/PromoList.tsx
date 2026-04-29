import type { PromotionDto } from "../../types/api";

interface PromoListProps {
  promotions: PromotionDto[];
  loading: boolean;
  error: string | null;
  onNueva: () => void;
  onEdit: (id: number) => void;
  onToggleActive: (id: number, activa: boolean) => void;
  updatingId: number | null;
}

export function PromoList({
  promotions,
  loading,
  error,
  onNueva,
  onEdit,
  onToggleActive,
  updatingId,
}: PromoListProps) {
  if (loading) {
    return <div className="empty-hint">Cargando promociones…</div>;
  }
  if (error) {
    return <div className="empty-hint">{error}</div>;
  }

  return (
    <>
      <div className="sec-header">
        <h2>Promociones semanales</h2>
        <button type="button" className="btn-primary" onClick={onNueva}>
          + Nueva promoción
        </button>
      </div>
      {promotions.map((p) => (
        <div key={p.id} className="card" style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#0B2A4A" }}>
                {p.titulo}
              </div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                {p.cursos.length} cursos
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: p.activa ? "#dcfce7" : "#f1f5f9",
                  color: p.activa ? "#166534" : "#64748b",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: 999,
                }}
              >
                {p.activa ? "Activa" : "Inactiva"}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={p.activa}
                  onChange={() => onToggleActive(p.id, !p.activa)}
                  disabled={updatingId === p.id}
                />
                <span className="slider"></span>
              </label>
              <button type="button" className="ab" onClick={() => onEdit(p.id)}>
                Editar
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {p.cursos.map((c) => (
              <span key={c.id} className="promo-chip">
                {c.nombre}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
