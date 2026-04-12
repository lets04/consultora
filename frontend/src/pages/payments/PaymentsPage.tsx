import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../api/client";
import { useRole } from "../../context/AuthContext";
import type { InscripcionDto } from "../../types/api";

interface PaymentsListResponse {
  filtro: string;
  items: InscripcionDto[];
  mensaje: string;
}

export function PaymentsPage({
  filtro,
  titulo,
  detalle,
}: {
  filtro: "todos" | "pendientes" | "parciales" | "pagados";
  titulo: string;
  detalle: string;
}) {
  const role = useRole();
  const isAdmin = role === "admin";
  const [items, setItems] = useState<InscripcionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [monto, setMonto] = useState("");
  const [tipoPago, setTipoPago] = useState<"efectivo" | "transferencia">(
    "efectivo",
  );
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const request =
      filtro === "todos"
        ? apiGet<InscripcionDto[]>("/api/inscriptions")
        : apiGet<PaymentsListResponse>(`/api/payments/${filtro}`);

    request
      .then((data) => {
        if (cancelled) return;

        if (filtro === "todos") {
          setItems(data as InscripcionDto[]);
        } else {
          setItems((data as PaymentsListResponse).items);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Error al cargar pagos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filtro, isAdmin]);

  async function handleCreatePayment() {
    if (!selectedInvoice) {
      setError("Selecciona una inscripción para pagar");
      return;
    }

    const value = Number(monto);
    if (!value || value <= 0) {
      setError("Ingresa un monto válido");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiPost("/api/payments", {
        inscripcionId: selectedInvoice,
        monto: value,
        tipoPago,
        numeroComprobante: numeroComprobante.trim() || undefined,
      });

      setSuccess("Pago registrado correctamente");
      setMonto("");
      setNumeroComprobante("");

      const reload =
        filtro === "todos"
          ? apiGet<InscripcionDto[]>("/api/inscriptions")
          : apiGet<PaymentsListResponse>(`/api/payments/${filtro}`);

      const selectedItem = items.find((i) => i.id === selectedInvoice);

      if (selectedItem?.estadoPago === "pagado") {
        setError("Esta inscripción ya está completamente pagada");
        return;
      }

      const data = await reload;

      const newItems =
        filtro === "todos"
          ? (data as InscripcionDto[])
          : (data as PaymentsListResponse).items;

      setItems(newItems);

      const updated = newItems.find((i) => i.id === selectedInvoice);
      if (updated) {
        setSelectedInvoice(updated.id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al registrar el pago",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-hint">Cargando pagos…</div>;
  if (error) return <div className="empty-hint">{error}</div>;

  if (!isAdmin) {
    return (
      <div className="card">
        <p className="empty-hint">No tienes permisos para ver pagos</p>
      </div>
    );
  }
  const selected = items.find((i) => i.id === selectedInvoice);
  const montoNumber = Number(monto) || 0;

  const saldoRestante = selected
    ? Math.max(selected.saldo - montoNumber, 0)
    : 0;

  return (
    <>
      <div className="sec-header">
        <h2>{titulo}</h2>
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ color: "#64748b", fontSize: 13 }}>{detalle}</p>
      </div>

      {success && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            background: "#ecfdf5",
            borderColor: "#22c55e",
          }}
        >
          {success}
        </div>
      )}

      <div className="card">
        <div className="form-section-title">Registrar pago</div>
        <div className="form-grid cols2">
          <div className="form-field">
            <label>Inscripción</label>
            <select
              value={selectedInvoice ?? ""}
              onChange={(event) =>
                setSelectedInvoice(Number(event.target.value) || null)
              }
            >
              <option value="">Selecciona una inscripción</option>
              {items.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                  disabled={item.estadoPago === "pagado"}
                >
                  {item.estudiante} — {item.curso} — {item.fecha}
                  {item.estadoPago === "pagado" ? " (Pagado)" : ""}
                </option>
              ))}
            </select>
            {selected && (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Total</span>
                  <strong>{selected.total} Bs</strong>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Pagado</span>
                  <span style={{ color: "#16a34a" }}>{selected.pagado} Bs</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                    paddingTop: 6,
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <strong>Saldo</strong>
                  <strong style={{ color: "#dc2626" }}>
                    {selected.saldo} Bs
                  </strong>
                </div>
              </div>
            )}
          </div>
          <div className="form-field">
            <label>Monto</label>
            <input
              type="number"
              min="0"
              placeholder="Ej. 200"
              value={monto}
              onChange={(event) => setMonto(event.target.value)}
            />
            {selected && monto && (
              <div style={{ fontSize: 12, marginTop: 6 }}>
                Saldo después del pago: <strong>{saldoRestante} Bs</strong>
              </div>
            )}
            {selected && montoNumber > selected.saldo && (
              <div style={{ color: "red", fontSize: 12 }}>
                El monto excede el saldo pendiente
              </div>
            )}
          </div>
          <div className="form-field">
            <label>Tipo de pago</label>
            <select
              value={tipoPago}
              onChange={(event) =>
                setTipoPago(event.target.value as "efectivo" | "transferencia")
              }
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
          <div className="form-field">
            <label>Número de comprobante</label>
            <input
              placeholder="Opcional"
              value={numeroComprobante}
              onChange={(event) => setNumeroComprobante(event.target.value)}
            />
          </div>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleCreatePayment}
            disabled={saving}
          >
            {saving ? "Registrando..." : "Registrar pago"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="form-section-title">Listado de inscripciones</div>
        {items.length === 0 ? (
          <p className="empty-hint">No hay inscripciones para este filtro.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Curso</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Saldo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500, color: "#0B2A4A" }}>
                    {item.estudiante}
                  </td>
                  <td>{item.curso}</td>
                  <td>{item.total} Bs</td>
                  <td>{item.pagado} Bs</td>
                  <td>{item.saldo} Bs</td>
                  <td>
                    <span className={"bs " + item.estadoPago}>
                      {item.estadoPago}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
