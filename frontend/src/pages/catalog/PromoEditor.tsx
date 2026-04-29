import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../api/client';
import type { AreaDto } from '../../types/api';

interface PromoEditorProps {
  onBack: () => void;
  onSave: () => void;
}

export function PromoEditor({ onBack, onSave }: PromoEditorProps) {
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [area, setArea] = useState<string>('todas');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<AreaDto[]>('/api/areas')
      .then((data) => {
        if (!cancelled) setAreas(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allCursos = useMemo(() => {
    const cursos: { name: string; area: string }[] = [];
    for (const a of areas) {
      for (const c of a.cursos) {
        cursos.push({ name: c.nombre, area: a.nombre });
      }
    }
    return cursos;
  }, [areas]);

  const filtered = useMemo(
    () => (area === 'todas' ? allCursos : allCursos.filter((c) => c.area === area)),
    [area, allCursos],
  );

  const areaOptions = useMemo(() => [
    { id: 'todas', label: 'Todas', color: '#94a3b8' },
    ...areas.map((a) => ({ id: a.nombre, label: a.nombre, color: a.color })),
  ], [areas]);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function handleSave() {
    if (selected.size !== 5 || !titulo.trim() || !periodo.trim()) return;

    setSaving(true);
    try {
      await apiPost('/api/promotions', {
        titulo: titulo.trim(),
        periodo: periodo.trim(),
        cursos: Array.from(selected),
      });
      onSave();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
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
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0B2A4A' }}>Nueva promoción semanal</div>
          <div style={{ fontSize: 11.5, color: '#64748b' }}>Selecciona los cursos para la promoción de cualquier área</div>
        </div>
        <span
          style={{
            background: '#2F5FD0',
            color: '#fff',
            fontSize: 11,
            fontWeight: 500,
            padding: '3px 10px',
            borderRadius: 20,
          }}
        >
          {selected.size}  cursos
        </span>
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
          <span className="fs-icon">◈</span> Filtrar por área
        </div>
        <div className="area-tabs">
          {areaOptions.map((a) => (
            <button
              key={a.id}
              type="button"
              className={'area-tab' + (area === a.id ? ' active' : '')}
              onClick={() => setArea(a.id)}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.color }} />
              {a.label}
            </button>
          ))}
        </div>
        <div className="course-grid">
          {filtered.map((c) => (
            <button
              key={c.name}
              type="button"
              className={'course-item' + (selected.has(c.name) ? ' selected' : '')}
              onClick={() => toggle(c.name)}
            >
              <input type="checkbox" readOnly checked={selected.has(c.name)} />
              <span className="ci-name">{c.name}</span>
              <span className="ci-area">{c.area}</span>
            </button>
          ))}
        </div>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn-secondary" onClick={onBack}>
            ← Volver
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={selected.size !== 5 || !titulo.trim() || !periodo.trim() || saving}
          >
            {saving ? 'Guardando…' : 'Guardar promoción'}
          </button>
        </div>
      </div>
    </>
  );
}
