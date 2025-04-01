import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

import { RootState } from '../store';
import { authActions } from '../store/auth/authSlice';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Компонент для защиты маршрутов, требующих аутентификации.
 * Перенаправляет неаутентифицированных пользователей на страницу входа.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { isAuthenticated, currentUser, loading, token } = useSelector(
    (state: RootState) => state.auth
  );

  // Проверяем токен и валидируем сессию при монтировании компонента
  useEffect(() => {
    // Если есть токен, но нет текущего пользователя, загружаем профиль
    if (token && !currentUser && !loading) {
      dispatch(authActions.validateToken());
    }
  }, [dispatch, token, currentUser, loading]);

  // Пока проверяем аутентификацию, показываем индикатор загрузки
  if (loading) {
    return (
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
    );
  }

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Если пользователь аутентифицирован, отображаем дочерние компоненты
  return <>{children}</>;
};

export default PrivateRoute;