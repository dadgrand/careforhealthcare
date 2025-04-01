import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';
import NotFoundPage from '../pages/NotFoundPage';

// Ленивая загрузка страниц
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

const DashboardPage = lazy(() => import('../pages/DashboardPage'));

const UserProfilePage = lazy(() => import('../pages/UserProfilePage'));
const UserListPage = lazy(() => import('../pages/user/UserListPage'));
const UserEditPage = lazy(() => import('../pages/user/UserEditPage'));

const FileManagerPage = lazy(() => import('../pages/file/FileManagerPage'));
const FileDetailsPage = lazy(() => import('../pages/file/FileDetailsPage'));

const NewsPage = lazy(() => import('../pages/news/NewsPage'));
const NewsDetailPage = lazy(() => import('../pages/news/NewsDetailPage'));
const NewsManagementPage = lazy(() => import('../pages/news/NewsManagementPage'));
const NewsEditorPage = lazy(() => import('../pages/news/NewsEditorPage'));

const TestingPage = lazy(() => import('../pages/testing/TestingPage'));
const TestTakingPage = lazy(() => import('../pages/testing/TestTakingPage'));
const TestResultsPage = lazy(() => import('../pages/testing/TestResultsPage'));
const TestManagementPage = lazy(() => import('../pages/testing/TestManagementPage'));
const TestEditorPage = lazy(() => import('../pages/testing/TestEditorPage'));

const AnalyticsDashboard = lazy(() => import('../pages/analytics/AnalyticsDashboard'));
const DepartmentAnalyticsPage = lazy(() => import('../pages/analytics/DepartmentAnalyticsPage'));
const UserAnalyticsPage = lazy(() => import('../pages/analytics/UserAnalyticsPage'));

const HomePage = lazy(() => import('../pages/public/HomePage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));

// Компонент-обертка для ленивой загрузки
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    }
  >
    {children}
  </Suspense>
);

const AppRoutes: React.FC = () => {
  return (
    <SuspenseWrapper>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
        </Route>

        {/* Маршруты аутентификации */}
        <Route path="/auth" element={<PublicLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Защищенные маршруты (требуется аутентификация) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Профиль пользователя */}
          <Route path="profile/:id" element={<UserProfilePage />} />
          <Route path="profile/:id/edit" element={<UserEditPage />} />

          {/* Управление пользователями (только для администраторов) */}
          <Route
            path="users"
            element={
              <RoleBasedRoute roles={['admin', 'manager']}>
                <UserListPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="users/new"
            element={
              <RoleBasedRoute roles={['admin']}>
                <UserEditPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="users/:id/edit"
            element={
              <RoleBasedRoute roles={['admin']}>
                <UserEditPage />
              </RoleBasedRoute>
            }
          />

          {/* Файловый менеджер */}
          <Route path="files" element={<FileManagerPage />} />
          <Route path="files/:folderId" element={<FileManagerPage />} />
          <Route path="file/:id" element={<FileDetailsPage />} />

          {/* Управление новостями (только для администраторов и редакторов) */}
          <Route
            path="news-management"
            element={
              <RoleBasedRoute roles={['admin', 'editor']}>
                <NewsManagementPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="news-management/new"
            element={
              <RoleBasedRoute roles={['admin', 'editor']}>
                <NewsEditorPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="news-management/:id/edit"
            element={
              <RoleBasedRoute roles={['admin', 'editor']}>
                <NewsEditorPage />
              </RoleBasedRoute>
            }
          />

          {/* Тестирование */}
          <Route path="testing" element={<TestingPage />} />
          <Route path="testing/:id" element={<TestTakingPage />} />
          <Route path="testing/:id/results" element={<TestResultsPage />} />
          <Route path="testing/my-assignments" element={<TestingPage />} />

          {/* Управление тестами (только для администраторов и преподавателей) */}
          <Route
            path="test-management"
            element={
              <RoleBasedRoute roles={['admin', 'teacher']}>
                <TestManagementPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="test-management/new"
            element={
              <RoleBasedRoute roles={['admin', 'teacher']}>
                <TestEditorPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="test-management/:id/edit"
            element={
              <RoleBasedRoute roles={['admin', 'teacher']}>
                <TestEditorPage />
              </RoleBasedRoute>
            }
          />

          {/* Аналитика (только для администраторов и руководителей) */}
          <Route
            path="analytics"
            element={
              <RoleBasedRoute roles={['admin', 'manager']}>
                <AnalyticsDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="analytics/departments/:id"
            element={
              <RoleBasedRoute roles={['admin', 'manager']}>
                <DepartmentAnalyticsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="analytics/users/:id"
            element={
              <RoleBasedRoute roles={['admin', 'manager']}>
                <UserAnalyticsPage />
              </RoleBasedRoute>
            }
          />
        </Route>

        {/* Страница 404 */}
        <Route path="/404" element={<NotFoundPage />} />

        {/* Редирект на страницу 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </SuspenseWrapper>
  );
};

export default AppRoutes;