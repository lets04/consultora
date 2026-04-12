interface PromoConfirmProps {
  onList: () => void;
  onAnother: () => void;
}

export function PromoConfirm({ onList, onAnother }: PromoConfirmProps) {
  return (
    <div className="card">
      <div className="success-box">
        <div className="success-icon">★</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#0B2A4A', marginBottom: 6 }}>Promoción guardada</div>
        <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 18 }}>
          La promoción semanal fue configurada correctamente con 5 cursos.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button type="button" className="btn-primary" onClick={onList}>
            Ver promociones
          </button>
          <button type="button" className="btn-secondary" onClick={onAnother}>
            Crear otra
          </button>
        </div>
      </div>
    </div>
  );
}
