import { useEffect, useState } from 'react';
import { apiGet } from '../../api/client';
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

  if (view === 'editor') {
    return <PromoEditor onBack={() => setView('list')} onSave={() => setView('confirm')} />;
  }
  if (view === 'confirm') {
    return <PromoConfirm onList={() => setView('list')} onAnother={() => setView('editor')} />;
  }
  return (
    <PromoList
      promotions={promotions}
      loading={loading}
      error={error}
      onNueva={() => setView('editor')}
      onEdit={() => setView('editor')}
    />
  );
}
