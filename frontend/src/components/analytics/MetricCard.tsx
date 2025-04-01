import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: number;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  loading = false,
}) => {
  // Определение иконки и цвета для изменения
  const getChangeDisplay = () => {
    if (change === undefined || change === 0) {
      return {
        icon: <TrendingFlatIcon fontSize="small" />,
        color: 'text.secondary',
        text: 'Без изменений',
      };
    }

    const isPositive = change > 0;

    return {
      icon: isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />,
      color: isPositive ? 'success.main' : 'error.main',
      text: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
    };
  };

  const changeDisplay = getChangeDisplay();

  // Форматирование значения для отображения
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            borderRadius: '50%',
            width: 40,
            height: 40,
            color: 'primary.main',
          }}>
            {icon}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 56, ml: 1 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {formatValue(value)}
            </Typography>

            {change !== undefined && (
              <Tooltip title={`По сравнению с предыдущим периодом`}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ color: changeDisplay.color, display: 'flex', alignItems: 'center' }}>
                    {changeDisplay.icon}
                    <Typography variant="body2" sx={{ ml: 0.5, color: changeDisplay.color }}>
                      {changeDisplay.text}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;