import { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete } from "../../api/client";
import type { PromotionDto } from "../../types/api";
import { PromoConfirm } from "./PromoConfirm";
import { PromoEditor } from "./PromoEditor";
import { PromoList } from "./PromoList";


type View = "list" | "editor" | "confirm";

export function PromocionesPage() {
  const [view, setView] = useState<View>("list");
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    titulo: string;
    inscripcionesCount: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionDto | null>(
    null,
  );

  useEffect(() => {
    if (view !== "list") return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiGet<PromotionDto[]>("/api/promotions")
      .then((data) => {
        if (!cancelled) setPromotions(data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error al cargar");
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
      setError(
        e instanceof Error ? e.message : "Error al actualizar promoción",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDeleteRequest(id: number) {
    const promotion = promotions.find((promotion) => promotion.id === id);
    if (!promotion) return;
    setPendingDelete({
      id,
      titulo: promotion.titulo,
      inscripcionesCount: promotion.inscripcionesCount,
    });
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/promotions/${pendingDelete.id}`);
      setPromotions((current) =>
        current.filter((promotion) => promotion.id !== pendingDelete.id),
      );
      setPendingDelete(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar promoción");
    } finally {
      setDeleting(false);
    }
  }

  if (view === "editor") {
    return (
      <PromoEditor
        promotion={editingPromotion}
        onBack={() => {
          setEditingPromotion(null);
          setView("list");
        }}
        onSave={() => {
          setEditingPromotion(null);
          setView("confirm");
        }}
      />
    );
  }
  if (view === "confirm") {
    return (
      <PromoConfirm
        onList={() => setView("list")}
        onAnother={() => setView("editor")}
      />
    );
  }
  return (
    <>
      <PromoList
        promotions={promotions}
        loading={loading}
        error={error}
        onNueva={() => {
          setEditingPromotion(null);
          setView("editor");
        }}
        onEdit={(id) => {
          setEditingPromotion(
            promotions.find((promotion) => promotion.id === id) ?? null,
          );
          setView("editor");
        }}
        onDelete={handleDeleteRequest}
        onToggleActive={handleToggleActive}
        updatingId={updatingId}
      />

      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div
            className="modal confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">!</div>
            <h3>Eliminar promoción</h3>
            {pendingDelete.inscripcionesCount > 0 ? (
              <p>
                No se puede eliminar promociones con inscripciones registradas.
              </p>
            ) : (
              <p>
                ¿Está seguro que desea eliminar <strong>{pendingDelete.titulo}</strong>?
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              {pendingDelete.inscripcionesCount === 0 && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
