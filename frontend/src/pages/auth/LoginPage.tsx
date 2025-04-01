import React from 'react';
import { Box, Container, Typography, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import LoginForm from '../../components/auth/LoginForm';
import { Logo } from '../../components/Logo';

/**
 * Страница входа в систему
 */
const LoginPage: React.FC = () => {
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
              maxWidth: { xs: '100%', md: '50%' },
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
              Добро пожаловать в систему управления медицинским учреждением
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{ textAlign: { xs: 'center', md: 'left' } }}
            >
              Войдите в свою учетную запись для доступа к модульной системе, которая
              включает в себя управление файлами, новостную ленту, систему тестирования
              и аналитические инструменты.
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
                Преимущества системы:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Централизованное хранение и доступ к файлам</li>
                <li>Система верификации документов для обеспечения подлинности</li>
                <li>Интерактивные тесты для проверки знаний персонала</li>
                <li>Детальная аналитика использования системы</li>
                <li>Информирование сотрудников через новостную ленту</li>
              </Typography>
            </Paper>
          </Box>

          {/* Правая секция с формой входа */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              maxWidth: { xs: '100%', md: '50%' },
              width: '100%',
            }}
          >
            <LoginForm />
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

export default LoginPage;