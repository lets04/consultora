export interface Student {
  id: number;
  nombre: string;
  ci: string;
  curso: string;
  inscripcion: string;
  pago: 'pagado' | 'parcial' | 'pendiente';
  registro?: string;
}
