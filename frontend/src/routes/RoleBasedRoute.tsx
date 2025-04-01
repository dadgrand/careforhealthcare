import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

import { RootState } from '../store';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  roles: string[];
  redirectTo?: string;
}

/**
 * Компонент для защиты маршрутов на основе ролей пользователя.
 * Проверяет, имеет ли пользователь требуемую роль для доступа к маршруту.
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  roles,
  redirectTo = '/dashboard',
}) => {
  const { currentUser, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Если пользователь не аутентифицирован, возвращаем ошибку
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Проверяем, имеет ли пользователь требуемую роль
  const hasRequiredRole = currentUser && roles.includes(currentUser.role);

  // Если у пользователя нет требуемой роли, показываем сообщение и/или редиректим
  if (!hasRequiredRole) {
    // Можно вернуть компонент с сообщением об ошибке доступа
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          py: 5,
        }}
      >
        <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Доступ запрещен
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          У вас нет прав для доступа к этой странице.
          Эта страница доступна только для пользователей со следующими ролями: {roles.join(', ')}.
        </Typography>
        <Button variant="contained" color="primary" href={redirectTo}>
          Вернуться на главную
        </Button>
      </Box>
    );

    // Или редирект на другую страницу:
    // return <Navigate to={redirectTo} replace />;
  }

  // Если у пользователя есть требуемая роль, отображаем дочерние компоненты
  return <>{children}</>;
};

export default RoleBasedRoute;