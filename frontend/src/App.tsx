import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleRoute } from '@/components/layout/RoleRoute';
import { HomePage } from '@/pages/HomePage';
import { JobsPage } from '@/pages/JobsPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { MyApplicationsPage } from '@/pages/candidate/MyApplicationsPage';
import { SavedJobsPage } from '@/pages/candidate/SavedJobsPage';
import { MyJobsPage } from '@/pages/employer/MyJobsPage';
import { JobFormPage } from '@/pages/employer/JobFormPage';
import { JobApplicantsPage } from '@/pages/employer/JobApplicantsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminJobsPage } from '@/pages/admin/AdminJobsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/ofertas" element={<JobsPage />} />
        <Route path="/ofertas/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar" element={<ForgotPasswordPage />} />
        <Route path="/restablecer" element={<ResetPasswordPage />} />

        {/* Requieren sesión */}
        <Route element={<ProtectedRoute />}>
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/notificaciones" element={<NotificationsPage />} />

          <Route element={<RoleRoute roles={['candidato', 'admin']} />}>
            <Route path="/candidato/postulaciones" element={<MyApplicationsPage />} />
            <Route path="/candidato/guardados" element={<SavedJobsPage />} />
          </Route>

          <Route element={<RoleRoute roles={['empleador', 'admin']} />}>
            <Route path="/empleador/ofertas" element={<MyJobsPage />} />
            <Route path="/empleador/ofertas/nueva" element={<JobFormPage />} />
            <Route path="/empleador/ofertas/:id/editar" element={<JobFormPage />} />
            <Route path="/empleador/ofertas/:id/postulaciones" element={<JobApplicantsPage />} />
          </Route>

          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/admin/ofertas" element={<AdminJobsPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
