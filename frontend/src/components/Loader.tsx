import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoaderProps {
  message?: string;
  size?: number;
  fullPage?: boolean;
  transparent?: boolean;
}

/**
 * Компонент для отображения индикатора загрузки
 */
export const Loader: React.FC<LoaderProps> = ({
  message = 'Загрузка...',
  size = 40,
  fullPage = false,
  transparent = false,
}) => {
  // Если загрузка на весь экран
  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: transparent ? 'rgba(255, 255, 255, 0.7)' : '#fff',
          zIndex: 9999,
        }}
      >
        <CircularProgress size={size} thickness={4} />
        {message && (
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // Обычный лоадер
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <CircularProgress size={size} thickness={4} />
      {message && (
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Компонент для отображения индикатора загрузки в таблице или списке
 */
export const TableLoader: React.FC<{ colSpan?: number }> = ({ colSpan = 1 }) => {
  return (
    <tr>
      <td colSpan={colSpan} style={{ textAlign: 'center', padding: '2rem' }}>
        <Loader size={30} message="Загрузка данных..." />
      </td>
    </tr>
  );
};

/**
 * Компонент для отображения индикатора загрузки в кнопке
 */
export const ButtonLoader: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return <CircularProgress size={size} thickness={4} sx={{ color: 'inherit' }} />;
};

/**
 * Компонент для отображения индикатора загрузки в блоке с содержимым
 */
export const ContentLoader: React.FC<LoaderProps> = (props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        minHeight: 200,
        width: '100%',
      }}
    >
      <Loader {...props} />
    </Box>
  );
};