import type { UserRole } from "./role";

export interface LoginResponse {
  token: string;
  userName: string;
  role: UserRole;
}

export interface MeResponse {
  userName: string;
  role: UserRole;
}

export interface DashboardAdminDto {
  totalEstudiantes: number;
  activos: number;
  pagoPendiente: number;
  nuevosMes: number;
  cobradoMes: number;
  pendienteBs: number;
  parcialBs: number;
  inscripcionesRecientes: { nombre: string; curso: string; pago: string }[];
}

export interface DashboardGerenteDto {
  estudiantesActivos: number;
  promocionSemana: number;
  areasActivas: number;
  cursosCatalogo: number;
  previewCursos: { area: string; curso: string }[];
  resumenEstudiantes: {
    totalRegistrados: number;
    pagoPendiente: number;
    inscripcionesActivas: number;
    nuevosMes: number;
  };
}

export interface PromotionDto {
  id: number;
  titulo: string;
  periodo: string;
  activa: boolean;
  cursos: {
    id: number;
    nombre: string;
  }[];
}

export interface AreaDto {
  id: number;
  nombre: string;
  color: string;
  cursos: { id: number; nombre: string }[];
}

export interface InscripcionDto {
  id: number;
  estudiante: string;
  curso: string;
  tipo: string;
  modalidad: string;
  fecha: string;
  total: number;
  pagado: number;
  saldo: number;
  estadoPago: "pendiente" | "parcial" | "pagado";
}

export interface PaymentsSummaryDto {
  pendientes: number;
  parciales: number;
  pagados: number;
}

export interface EstudianteConcluidoDto {
  id: number;
  nombre: string;
  ci: string;
  registro: string;
  modalidad: "certificado" | "examen";
  curso: string;
  inscripcion: string;
  tipo: "individual" | "promocion";
}

export interface StudentPortalCourseDto {
  id: number;
  nombre: string;
  area: string;
  tipo: "curso" | "promocion";
  promocionNombre?: string;
  modalidad: "certificado" | "examen";
  fechaInscripcion: string;
  nota?: number;
}

export interface StudentPortalDto {
  id: number;
  ci: string;
  nombreCompleto: string;
  prefijo?: string;
  profesion?: string;
  telefono?: string;
  email?: string;
  departamento?: string;
  cursos: StudentPortalCourseDto[];
}
