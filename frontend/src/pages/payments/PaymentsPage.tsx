import { Fragment, useEffect, useState } from "react";
import { apiGet, apiPost } from "../../api/client";
import { useRole } from "../../context/AuthContext";
import type { InscripcionDto } from "../../types/api";

interface PaymentsListResponse {
  filtro: string;
  items: InscripcionDto[];
}

type PaymentFilter = "todos" | "pendiente" | "parcial" | "pagado";
type PaymentRouteFilter = PaymentFilter | "pendientes" | "parciales" | "pagados";

interface PaymentsPageProps {
  filtro?: PaymentRouteFilter;
  titulo?: string;
  detalle?: string;
}

const filterMap: Record<PaymentRouteFilter, PaymentFilter> = {
  todos: "todos",
  pendiente: "pendiente",
  parcial: "parcial",
  pagado: "pagado",
  pendientes: "pendiente",
  parciales: "parcial",
  pagados: "pagado",
};

const filters: { value: PaymentFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "parcial", label: "Parcial" },
  { value: "pagado", label: "Pagado" },
];

export function PaymentsPage({
  filtro: filtroInicial = "todos",
  titulo = "Pagos",
  detalle,
}: PaymentsPageProps) {
  const role = useRole();
  const isAdmin = role === "admin";

  const [filtro, setFiltro] = useState<PaymentFilter>(
    filterMap[filtroInicial],
  );

  const [items, setItems] = useState<InscripcionDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [openRow, setOpenRow] = useState<number | null>(null);

  const [monto, setMonto] = useState("");
  const [tipoPago, setTipoPago] = useState<"efectivo" | "transferencia">(
    "efectivo",
  );
  const [numeroComprobante, setNumeroComprobante] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [activeInput, setActiveInput] = useState<number | null>(null);

  const esPagado = filtro === "pagado";
  const colSpan = esPagado ? 4 : 8;

  useEffect(() => {
    setFiltro(filterMap[filtroInicial]);
  }, [filtroInicial]);

  // cargar datos
  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    const request =
      filtro === "todos"
        ? apiGet<InscripcionDto[]>("/api/inscriptions")
        : apiGet<PaymentsListResponse>(`/api/payments/${filtro}`);

    request
      .then((data) => {
        setItems(
          filtro === "todos"
            ? (data as InscripcionDto[])
            : (data as PaymentsListResponse).items,
        );
      })
      .catch(() => setError("Error al cargar pagos"))
      .finally(() => setLoading(false));
  }, [filtro, isAdmin]);

  async function handlePago(item: InscripcionDto) {
    const value = Number(monto);

    if (!value || value <= 0) {
      setError("Monto inválido");
      return;
    }

    if (value > item.saldo) {
      setError("El monto excede el saldo");
      return;
    }

    if (item.estadoPago === "pagado") {
      setError("Ya está pagado");
      return;
    }

    await apiPost("/api/payments", {
      inscripcionId: item.id,
      monto: value,
      tipoPago,
      numeroComprobante: numeroComprobante || undefined,
    });

    // reset
    setMonto("");
    setNumeroComprobante("");
    setOpenRow(null);
    setError(null);

    // recargar
    const reload =
      filtro === "todos"
        ? apiGet<InscripcionDto[]>("/api/inscriptions")
        : apiGet<PaymentsListResponse>(`/api/payments/${filtro}`);

    const data = await reload;

    setItems(
      filtro === "todos"
        ? (data as InscripcionDto[])
        : (data as PaymentsListResponse).items,
    );
  }

  if (loading) return <div className="empty-hint">Cargando…</div>;

  return (
    <>
      <div className="sec-header">
        <div>
          <h2>{titulo}</h2>
          {detalle && <p>{detalle}</p>}
        </div>
      </div>

      {/* 🔷 TABS */}
      <div className="tabs-pro">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={filtro === filter.value ? "active" : ""}
            onClick={() => setFiltro(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <div className="error-text">{error}</div>}

      {/* 🔷 TABLA */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Fecha</th>
              <th>Total</th>
              {!esPagado && (
                <>
                  <th>Pagado</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                </>
              )}

              {!esPagado && <th></th>}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const montoNumber = Number(monto) || 0;
              const isInvalid =
                !monto || Number(monto) <= 0 || Number(monto) > item.saldo;
              const saldoRestante = Math.max(item.saldo - montoNumber, 0);

              return (
                <Fragment key={item.id}>
                  {/* FILA */}
                  <tr>
                    <td>{item.estudiante}</td>
                    <td>{item.curso}</td>
                    <td>{item.fecha}</td>
                    <td>{item.total} Bs</td>

                    {!esPagado && (
                      <>
                        <td>{item.pagado} Bs</td>
                        <td>
                          <strong>{item.saldo} Bs</strong>
                        </td>
                        <td>
                          <span className={"bs " + item.estadoPago}>
                            {item.estadoPago}
                          </span>
                        </td>

                        <td>
                          {item.estadoPago !== "pagado" && (
                            <button
                              className="btn-inline"
                              onClick={() =>
                                setOpenRow(openRow === item.id ? null : item.id)
                              }
                            >
                              {openRow === item.id
                                ? "Cancelar"
                                : "Registrar pago"}
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>

                  {/* FORM INLINE */}
                  {openRow === item.id && (
                    <tr className="expand-row">
                      <td colSpan={colSpan}>
                        <div className="inline-form">
                          {/* INFO */}
                          <div className="inline-info">
                            <div>
                              Total: <strong>{item.total} Bs</strong>
                            </div>
                            <div>Pagado: {item.pagado} Bs</div>
                            <div style={{ color: "#dc2626" }}>
                              Saldo: {item.saldo} Bs
                            </div>
                          </div>

                          {/* INPUT */}
                          <div className="inline-field">
                            <input
                              type="number"
                              placeholder={`Máx. ${item.saldo}`}
                              value={monto}
                              onFocus={() => setActiveInput(item.id)}
                              onBlur={() => setActiveInput(null)}
                              onChange={(e) => {
                                let value = Number(e.target.value);

                                if (value > item.saldo) value = item.saldo;

                                setMonto(value.toString());
                              }}
                              className={
                                activeInput === item.id ? "input-active" : ""
                              }
                            />

                            {monto && (
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: -16,
                                  left: 2,
                                  fontSize: 11,
                                  color: "#64748b",
                                }}
                              >
                                Saldo: {saldoRestante} Bs
                              </span>
                            )}

                            {montoNumber > item.saldo && (
                              <div className="error-text">Excede el saldo</div>
                            )}
                          </div>

                          {/* SELECT */}
                          <select
                            value={tipoPago}
                            onChange={(e) =>
                              setTipoPago(
                                e.target.value as
                                  | "efectivo"
                                  | "transferencia",
                              )
                            }
                          >
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                          </select>

                          {/* COMPROBANTE */}
                          <input
                            placeholder="Comprobante"
                            value={numeroComprobante}
                            onChange={(e) =>
                              setNumeroComprobante(e.target.value)
                            }
                          />

                          {/* BOTÓN */}
                          <button
                            className="btn-primary btn-pay-premium"
                            onClick={() => handlePago(item)}
                            disabled={isInvalid}
                          >
                            Confirmar pago
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
