export interface Student {
  id: number;
  nombre: string;
  ci: string;
  prefijo?: string;
  profesion?: string;
  curso: string;
  inscripcion: string;
  pago: 'pagado' | 'parcial' | 'pendiente';
  registro?: string;
  adminEmail?: string;
}
