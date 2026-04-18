export type PagoEstado = "pagado" | "parcial" | "pendiente";

export interface CursoInscrito {
  id: number;
  nombre: string;
  area: string;
  modalidad: string;
  inicio: string;
  estado: string;
  tipo?: "curso" | "promocion";
  nombrePromocion?: string;
  nota?: number;
}

export interface PagoItem {
  monto: number;
  fecha: string;
  tipoPago: string;
  numeroComprobante?: string;
}

export interface Estudiante {
  id: string;
  nombre: string;
  ci: string;

  tipoInscripcion?: "promocion" | "individual";
  promocionNombre?: string;

  curso: string;
  inscripcion: string;
  pago: PagoEstado;
  registro?: string;

  telefono?: string;
  email?: string;
  departamento?: string;

  cursos?: CursoInscrito[];
  pagos?: PagoItem[];
}
