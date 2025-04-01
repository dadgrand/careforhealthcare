import React from 'react';
import { Box, Container, Typography, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import RegisterForm from '../../components/auth/RegisterForm';
import { Logo } from '../../components/Logo';

/**
 * Страница регистрации в системе
 */
const RegisterPage: React.FC = () => {
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
        maxWidth="lg"
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
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {/* Левая секция с описанием */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: { xs: 'center', md: 'flex-start' },
              p: 3,
              maxWidth: { xs: '100%', md: '40%' },
              mb: { xs: 4, md: 0 },
            }}
          >
            <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
              <Logo variant="large" withText />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{ textAlign: { xs: 'center', md: 'left' } }}
            >
              Создайте учетную запись в системе
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{ textAlign: { xs: 'center', md: 'left' } }}
            >
              Зарегистрируйтесь для доступа к функциям системы управления. После регистрации
              администратор проверит ваши данные и активирует аккаунт.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                width: { xs: '100%', md: '80%' },
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Требования безопасности:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Используйте корпоративную электронную почту</li>
                <li>Создайте надежный пароль (минимум 8 символов, включая буквы и цифры)</li>
                <li>Никогда не передавайте свои учетные данные третьим лицам</li>
                <li>Ознакомьтесь с политикой безопасности организации</li>
              </Typography>
            </Paper>
          </Box>

          {/* Правая секция с формой регистрации */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              maxWidth: { xs: '100%', md: '60%' },
              width: '100%',
            }}
          >
            <RegisterForm />
          </Box>
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

export default RegisterPage;