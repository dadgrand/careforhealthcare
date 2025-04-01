import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, Container, Divider } from '@mui/material';

/**
 * Компонент футера приложения
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
          }}
        >
          {/* Копирайт */}
          <Box sx={{ mb: { xs: 2, sm: 0 } }}>
            <Typography variant="body2" color="text.secondary" align="center">
              &copy; {currentYear} МедСистема. Все права защищены.
            </Typography>
          </Box>

          {/* Ссылки */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: { xs: 1, sm: 3 },
            }}
          >
            <Link
              component={RouterLink}
              to="/about"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              О системе
            </Link>

            <Link
              component={RouterLink}
              to="/privacy"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              Политика конфиденциальности
            </Link>

            <Link
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              Условия использования
            </Link>

            <Link
              component={RouterLink}
              to="/contact"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              Контакты
            </Link>
          </Box>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Версия 1.0.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};