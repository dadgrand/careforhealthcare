import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/Loader';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Ленивая загрузка страниц для оптимизации
// Аутентификация
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

// Основные страницы
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const HelpPage = lazy(() => import('../pages/HelpPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Новости
const NewsListPage = lazy(() => import('../pages/news/NewsListPage'));
const NewsDetailPage = lazy(() => import('../pages/news/NewsDetailPage'));
const NewsCreatePage = lazy(() => import('../pages/news/NewsCreatePage'));
const NewsEditPage = lazy(() => import('../pages/news/NewsEditPage'));

// Файлы
const FilesListPage = lazy(() => import('../pages/files/FilesListPage'));
const MyFilesPage = lazy(() => import('../pages/files/MyFilesPage'));
const SharedFilesPage = lazy(() => import('../pages/files/SharedFilesPage'));
const FileDetailPage = lazy(() => import('../pages/files/FileDetailPage'));
const FileVerificationsPage = lazy(() => import('../pages/files/FileVerificationsPage'));

// Тесты
const TestsListPage = lazy(() => import('../pages/tests/TestsListPage'));
const TestDetailPage = lazy(() => import('../pages/tests/TestDetailPage'));
const TestAssignmentsPage = lazy(() => import('../pages/tests/TestAssignmentsPage'));
const TestResultsPage = lazy(() => import('../pages/tests/TestResultsPage'));
const TestCreatePage = lazy(() => import('../pages/tests/TestCreatePage'));
const TestEditPage = lazy(() => import('../pages/tests/TestEditPage'));
const TestAttemptPage = lazy(() => import('../pages/tests/TestAttemptPage'));

// Документы
const DocumentsPage = lazy(() => import('../pages/documents/DocumentsPage'));

// Медицинская информация
const MedicalInfoPage = lazy(() => import('../pages/medical/MedicalInfoPage'));

// Администрирование
const UsersListPage = lazy(() => import('../pages/admin/UsersListPage'));
const UserDetailPage = lazy(() => import('../pages/admin/UserDetailPage'));
const DepartmentsPage = lazy(() => import('../pages/admin/DepartmentsPage'));
const SpecializationsPage = lazy(() => import('../pages/admin/SpecializationsPage'));
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'));
const SystemSettingsPage = lazy(() => import('../pages/admin/SystemSettingsPage'));

// Страницы информации
const AboutPage = lazy(() => import('../pages/info/AboutPage'));
const PrivacyPage = lazy(() => import('../pages/info/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/info/TermsPage'));
const ContactPage = lazy(() => import('../pages/info/ContactPage'));

/**
 * Основной компонент маршрутизации
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Показываем лоадер, пока проверяем аутентификацию
  if (loading) {
    return <Loader fullPage message="Загрузка приложения..." />;
  }

  return (
    <Suspense fallback={<Loader fullPage message="Загрузка страницы..." />}>
      <Routes>
        {/* Аутентификация */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
        <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPasswordPage />} />

        {/* Информационные страницы */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Защищенные маршруты */}
        <Route element={<ProtectedRoute />}>
          {/* Основной макет для защищенных маршрутов */}
          <Route element={<MainLayout />}>
            {/* Редирект с корневого маршрута */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Дашборд */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Профиль и настройки */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* Новости */}
            <Route path="/news" element={<NewsListPage />} />
            <Route path="/news/:slug" element={<NewsDetailPage />} />
            <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
              <Route path="/news/create" element={<NewsCreatePage />} />
              <Route path="/news/:slug/edit" element={<NewsEditPage />} />
            </Route>

            {/* Файлы */}
            <Route path="/files" element={<FilesListPage />} />
            <Route path="/files/my" element={<MyFilesPage />} />
            <Route path="/files/shared" element={<SharedFilesPage />} />
            <Route path="/files/:id" element={<FileDetailPage />} />
            <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
              <Route path="/files/verification" element={<FileVerificationsPage />} />
            </Route>

            {/* Тесты */}
            <Route path="/tests" element={<TestsListPage />} />
            <Route path="/tests/:id" element={<TestDetailPage />} />
            <Route path="/tests/my-assignments" element={<TestAssignmentsPage />} />
            <Route path="/tests/my-results" element={<TestResultsPage />} />
            <Route path="/tests/:id/attempt/:attemptId" element={<TestAttemptPage />} />
            <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'doctor']} />}>
              <Route path="/tests/create" element={<TestCreatePage />} />
              <Route path="/tests/:id/edit" element={<TestEditPage />} />
            </Route>

            {/* Документы */}
            <Route path="/documents" element={<DocumentsPage />} />

            {/* Медицинская информация */}
            <Route path="/medical" element={<MedicalInfoPage />} />

            {/* Админ-панель */}
            <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
              <Route path="/admin/users" element={<UsersListPage />} />
              <Route path="/admin/users/:id" element={<UserDetailPage />} />
              <Route path="/admin/departments" element={<DepartmentsPage />} />
              <Route path="/admin/specializations" element={<SpecializationsPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Системные настройки (только для админов) */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin/settings" element={<SystemSettingsPage />} />
            </Route>

            {/* Страница 404 внутри приложения */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Страница 404 вне приложения */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;