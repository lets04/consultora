import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '../../api/client';
import type { PromotionDto } from '../../types/api';
import { PromoConfirm } from './PromoConfirm';
import { PromoEditor } from './PromoEditor';
import { PromoList } from './PromoList';

type View = 'list' | 'editor' | 'confirm';

export function PromocionesPage() {
  const [view, setView] = useState<View>('list');
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<PromotionDto | null>(null);

  useEffect(() => {
    if (view !== 'list') return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiGet<PromotionDto[]>('/api/promotions')
      .then((data) => {
        if (!cancelled) setPromotions(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view]);

  async function handleToggleActive(id: number, activa: boolean) {
    setUpdatingId(id);
    setError(null);
    try {
      await apiPut(`/api/promotions/${id}/status`, { activa });
      setPromotions((current) =>
        current.map((promotion) =>
          promotion.id === id ? { ...promotion, activa } : promotion,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar promoción');
    } finally {
      setUpdatingId(null);
    }
  }

  if (view === 'editor') {
    return (
      <PromoEditor
        promotion={editingPromotion}
        onBack={() => {
          setEditingPromotion(null);
          setView('list');
        }}
        onSave={() => {
          setEditingPromotion(null);
          setView('confirm');
        }}
      />
    );
  }
  if (view === 'confirm') {
    return <PromoConfirm onList={() => setView('list')} onAnother={() => setView('editor')} />;
  }
  return (
    <PromoList
      promotions={promotions}
      loading={loading}
      error={error}
      onNueva={() => {
        setEditingPromotion(null);
        setView('editor');
      }}
      onEdit={(id) => {
        setEditingPromotion(promotions.find((promotion) => promotion.id === id) ?? null);
        setView('editor');
      }}
      onToggleActive={handleToggleActive}
      updatingId={updatingId}
    />
  );
}
