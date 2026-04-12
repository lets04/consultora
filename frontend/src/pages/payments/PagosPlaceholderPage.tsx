export function PagosPlaceholderPage({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="card">
      <div className="sec-header">
        <h2>{titulo}</h2>
      </div>
      <p style={{ color: '#64748b', fontSize: 13 }}>{detalle}</p>
    </div>
  );
}
