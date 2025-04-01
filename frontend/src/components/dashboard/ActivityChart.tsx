import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Компонент графика активности для дашборда
 */
const ActivityChart: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<string>('week');

  // Обработчик изменения временного диапазона
  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  // Генерация данных в зависимости от выбранного диапазона
  const getChartData = () => {
    let labels: string[] = [];

    // Формируем метки в зависимости от выбранного диапазона
    if (timeRange === 'week') {
      labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    } else if (timeRange === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    } else {
      labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    }

    // Генерируем случайные данные для примера
    const generateRandomData = (min: number, max: number, count: number) => {
      return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    };

    // Цвет для основного датасета
    const primaryColor = theme.palette.primary.main;
    const primaryLightColor = theme.palette.primary.light;

    // Цвет для второго датасета
    const secondaryColor = theme.palette.secondary.main;
    const secondaryLightColor = theme.palette.secondary.light;

    return {
      labels,
      datasets: [
        {
          label: 'Просмотры файлов',
          data: generateRandomData(10, 50, labels.length),
          borderColor: primaryColor,
          backgroundColor: primaryLightColor,
          tension: 0.4,
          fill: false,
          pointBackgroundColor: primaryColor,
          pointBorderColor: theme.palette.background.paper,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Пройденные тесты',
          data: generateRandomData(5, 20, labels.length),
          borderColor: secondaryColor,
          backgroundColor: secondaryLightColor,
          tension: 0.4,
          fill: false,
          pointBackgroundColor: secondaryColor,
          pointBorderColor: theme.palette.background.paper,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  // Опции графика
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        bodyFont: {
          family: theme.typography.fontFamily,
        },
        titleFont: {
          family: theme.typography.fontFamily,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
          color: theme.palette.text.secondary,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
          color: theme.palette.text.secondary,
          maxTicksLimit: 6,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="week">
            Неделя
          </ToggleButton>
          <ToggleButton value="month">
            Месяц
          </ToggleButton>
          <ToggleButton value="year">
            Год
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 300 }}>
        <Line data={getChartData()} options={chartOptions} />
      </Box>
    </Box>
  );
};

export default ActivityChart;