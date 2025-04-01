import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/Loader';

/**
 * Компонент для защиты маршрутов, требующих аутентификации
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Пока проверяем аутентификацию, показываем лоадер
  if (loading) {
    return <Loader fullPage message="Проверка аутентификации..." />;
  }

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  // и сохраняем текущий маршрут для последующего редиректа после входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если пользователь аутентифицирован, отображаем дочерние маршруты
  return <Outlet />;
};

export default ProtectedRoute;