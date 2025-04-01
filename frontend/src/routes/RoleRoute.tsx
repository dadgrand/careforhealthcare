import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

/**
 * Компонент для защиты маршрутов по ролям пользователей
 */
const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { userRole } = useAuth();
  const location = useLocation();

  // Если пользователь не имеет необходимой роли, перенаправляем на дашборд
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // Если роль пользователя в списке разрешенных, отображаем дочерние маршруты
  return <Outlet />;
};

export default RoleRoute;