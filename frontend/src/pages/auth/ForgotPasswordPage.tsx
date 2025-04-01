import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import PasswordResetForm from '../../components/auth/PasswordResetForm';
import { Logo } from '../../components/Logo';

/**
 * Страница восстановления пароля
 */
const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Logo variant="large" withText />
        </Box>

        <PasswordResetForm />

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Вспомнили пароль?{' '}
            <Link component={RouterLink} to="/login" variant="body2">
              Вернуться к входу
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Нет аккаунта?{' '}
            <Link component={RouterLink} to="/register" variant="body2">
              Зарегистрироваться
            </Link>
          </Typography>
        </Box>
      </Container>

      {/* Футер */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          textAlign: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} МедСистема. Все права защищены.
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Link component={RouterLink} to="/about" color="text.secondary" sx={{ mx: 1 }}>
            О системе
          </Link>
          <Link component={RouterLink} to="/privacy" color="text.secondary" sx={{ mx: 1 }}>
            Политика конфиденциальности
          </Link>
          <Link component={RouterLink} to="/terms" color="text.secondary" sx={{ mx: 1 }}>
            Условия использования
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;