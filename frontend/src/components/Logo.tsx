import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

interface LogoProps {
  variant?: 'default' | 'small' | 'large';
  withText?: boolean;
  onClick?: () => void;
}

/**
 * Компонент логотипа системы
 */
export const Logo: React.FC<LogoProps> = ({ variant = 'default', withText = true, onClick }) => {
  const theme = useTheme();

  // Определяем размер логотипа в зависимости от варианта
  const getSize = (): number => {
    switch (variant) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  // Определяем размер шрифта в зависимости от варианта
  const getFontSize = (): string => {
    switch (variant) {
      case 'small':
        return '1rem';
      case 'large':
        return '1.75rem';
      default:
        return '1.25rem';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <LocalHospitalIcon
        sx={{
          color: theme.palette.primary.main,
          fontSize: getSize(),
          mr: withText ? 1 : 0,
        }}
      />

      {withText && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: getFontSize(),
            letterSpacing: '0.5px',
          }}
        >
          МедСистема
        </Typography>
      )}
    </Box>
  );
};