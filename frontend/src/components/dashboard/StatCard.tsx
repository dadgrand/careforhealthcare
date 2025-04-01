import React from 'react';
import { Box, Card, CardContent, Typography, Divider, IconButton, Theme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowForward as ArrowIcon, TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'default';
  trend?: {
    value: number;
    label: string;
    direction?: 'up' | 'down' | 'flat';
  };
  link?: string;
}

/**
 * Компонент карточки статистики для дашборда
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  link,
}) => {
  // Выбор цвета в зависимости от параметра
  const getColor = (theme: Theme) => {
    switch (color) {
      case 'primary':
        return theme.palette.primary;
      case 'secondary':
        return theme.palette.secondary;
      case 'success':
        return theme.palette.success;
      case 'info':
        return theme.palette.info;
      case 'warning':
        return theme.palette.warning;
      case 'error':
        return theme.palette.error;
      default:
        return theme.palette.primary;
    }
  };

  // Иконка для тренда
  const getTrendIcon = () => {
    const direction = trend?.direction || (trend?.value && trend.value > 0 ? 'up' : trend?.value === 0 ? 'flat' : 'down');

    switch (direction) {
      case 'up':
        return <TrendingUp fontSize="small" color="success" />;
      case 'down':
        return <TrendingDown fontSize="small" color="error" />;
      default:
        return <TrendingFlat fontSize="small" color="action" />;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 5,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              fontSize: '1rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: alpha(getColor(theme).main, 0.1),
              color: getColor(theme).main,
            })}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          {value}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {getTrendIcon()}
            <Typography
              variant="body2"
              sx={{ ml: 0.5 }}
              color={
                trend.direction === 'down' ? 'error.main' :
                trend.direction === 'up' ? 'success.main' :
                'text.secondary'
              }
            >
              {trend.value !== 0 && (trend.value > 0 ? '+' : '')}{trend.value} {trend.label}
            </Typography>
          </Box>
        )}

        {link && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <IconButton
                component={RouterLink}
                to={link}
                size="small"
                color={color === 'default' ? 'primary' : color}
                sx={{ p: 0 }}
              >
                <ArrowIcon fontSize="small" />
              </IconButton>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;