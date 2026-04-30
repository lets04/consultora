import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppShell } from "./layout/AppShell";
import { RequireAuth } from "./layout/RequireAuth";
import { RoleGuard } from "./layout/RoleGuard";
import { LoginPage } from "./pages/auth/LoginPage";
import { AreasCursosPage } from "./pages/catalog/AreasCursosPage";
import { PromocionesPage } from "./pages/catalog/PromocionesPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { EnCursoPage } from "./pages/inscriptions/EnCursoPage";
import { InscripcionesPage } from "./pages/inscriptions/InscripcionesPage";
import { NuevaInscripcionPage } from "./pages/inscriptions/NuevaInscripcionPage";
import { PaymentsPage } from "./pages/payments/PaymentsPage";
import { StudentPortalLoginPage } from "./pages/students/StudentPortalLoginPage";
import { StudentPortalPage } from "./pages/students/StudentPortalPage";
import { EstudiantesPage } from "./pages/students/EstudiantesPage";
import { EstudiantesConcluidosPage } from "./pages/students/EstudiantesConcluidosPage";
import { RegistrarEstudiantePage } from "./pages/students/RegistrarEstudiantePage";
import { StudentDetailPage } from "./pages/students/StudentDetailPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/portal-estudiante" element={<StudentPortalLoginPage />} />
        <Route
          path="/portal-estudiante/:ci"
          element={<StudentPortalPage />}
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route
            path="promociones"
            element={
              <RoleGuard allow={["gerente"]}>
                <PromocionesPage />
              </RoleGuard>
            }
          />
          <Route
            path="areas"
            element={
              <RoleGuard allow={["gerente"]}>
                <AreasCursosPage />
              </RoleGuard>
            }
          />

          <Route path="estudiantes" element={<EstudiantesPage />} />

          <Route
            path="estudiantes/nuevo"
            element={
              <RoleGuard allow={["admin", "gerente"]}>
                <RegistrarEstudiantePage />
              </RoleGuard>
            }
          />

          <Route
            path="estudiantes/ver/:ci"
            element={
              <RoleGuard allow={["admin", "gerente"]}>
                <StudentDetailPage />
              </RoleGuard>
            }
          />

          <Route
            path="estudiantes/editar/:ci"
            element={
              <RoleGuard allow={["admin", "gerente"]}>
                <RegistrarEstudiantePage />
              </RoleGuard>
            }
          />

          <Route
            path="estudiantes/concluidos"
            element={
              <RoleGuard allow={["admin"]}>
                <EstudiantesConcluidosPage />
              </RoleGuard>
            }
          />

          <Route
            path="inscripciones"
            element={
              <RoleGuard allow={["admin"]}>
                <InscripcionesPage />
              </RoleGuard>
            }
          />
          <Route
            path="inscripciones/nueva"
            element={
              <RoleGuard allow={["admin"]}>
                <NuevaInscripcionPage />
              </RoleGuard>
            }
          />
          <Route
            path="inscripciones/en-curso"
            element={
              <RoleGuard allow={["admin"]}>
                <EnCursoPage />
              </RoleGuard>
            }
          />

          <Route
            path="pagos/todos"
            element={
              <RoleGuard allow={["admin"]}>
                <PaymentsPage filtro="todos" titulo="" detalle="" />
              </RoleGuard>
            }
          />
         

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
