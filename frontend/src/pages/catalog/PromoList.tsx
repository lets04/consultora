import type { PromotionDto } from '../../types/api';

interface PromoListProps {
  promotions: PromotionDto[];
  loading: boolean;
  error: string | null;
  onNueva: () => void;
  onEdit: (id: number) => void;
}

export function PromoList({ promotions, loading, error, onNueva, onEdit }: PromoListProps) {
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0B2A4A' }}>{p.titulo}</div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                {p.periodo} · {p.cursos.length} cursos
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={'bs ' + (p.activa ? 'activo' : 'inactivo')}>{p.activa ? 'Activa' : 'Finalizada'}</span>
              <button type="button" className="ab" onClick={() => onEdit(p.id)}>
                {p.activa ? 'Editar' : 'Ver'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {p.cursos.map((c) => (
              <span
                key={c}
                className="promo-chip"
                style={
                  p.activa
                    ? undefined
                    : { background: '#f1f5f9', borderColor: '#dde3ea', color: '#64748b' }
                }
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
