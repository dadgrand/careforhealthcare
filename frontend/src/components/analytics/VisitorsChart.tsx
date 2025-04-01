import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';

import { VisitData } from '../../types/analytics';

interface VisitorsChartProps {
  data: VisitData[];
}

const VisitorsChart: React.FC<VisitorsChartProps> = ({ data }) => {
  const theme = useTheme();
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  // Обработчик изменения представления
  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'daily' | 'weekly' | null,
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  // Агрегирование данных по неделям
  const getWeeklyData = () => {
    if (!data.length) return [];

    const weekMap = new Map<string, VisitData>();

    data.forEach(item => {
      const date = new Date(item.date);
      const yearWeek = getYearWeek(date);
      const key = `${yearWeek.year}-W${yearWeek.week}`;

      if (weekMap.has(key)) {
        const weekData = weekMap.get(key)!;
        weekMap.set(key, {
          date: key,
          uniqueVisitors: weekData.uniqueVisitors + item.uniqueVisitors,
          totalVisits: weekData.totalVisits + item.totalVisits,
          avgSessionTime: (weekData.avgSessionTime * weekData.totalVisits + item.avgSessionTime * item.totalVisits) /
                         (weekData.totalVisits + item.totalVisits),
        });
      } else {
        weekMap.set(key, {
          date: key,
          uniqueVisitors: item.uniqueVisitors,
          totalVisits: item.totalVisits,
          avgSessionTime: item.avgSessionTime,
        });
      }
    });

    return Array.from(weekMap.values());
  };

  // Получение номера недели в году
  const getYearWeek = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return { year: date.getFullYear(), week: weekNumber };
  };

  // Форматирование даты для оси X
  const formatXAxis = (value: string) => {
    if (view === 'weekly') {
      return value.split('-W')[1] ? `Нед. ${value.split('-W')[1]}` : value;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return `${date.getDate()}.${date.getMonth() + 1}`;
  };

  // Форматирование всплывающей подсказки
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = view === 'weekly'
        ? `Неделя ${label.split('-W')[1]}, ${label.split('-W')[0]}`
        : new Date(label).toLocaleDateString();

      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Box sx={{ fontWeight: 'bold', mb: 1 }}>{date}</Box>
          {payload.map((entry: any, index: number) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: entry.color,
                  mr: 1,
                  borderRadius: '50%',
                }}
              />
              <Box>
                {entry.name}: {entry.value} {entry.unit}
              </Box>
            </Box>
          ))}
        </Box>
      );
    }

    return null;
  };

  // Данные для отображения
  const chartData = view === 'weekly' ? getWeeklyData() : data;

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="daily">По дням</ToggleButton>
          <ToggleButton value="weekly">По неделям</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tickMargin={10}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="uniqueVisitors"
            name="Уникальные посетители"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.light}
            fillOpacity={0.3}
            activeDot={{ r: 8 }}
            unit="чел."
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="totalVisits"
            name="Общее число посещений"
            stroke={theme.palette.secondary.main}
            fill={theme.palette.secondary.light}
            fillOpacity={0.3}
            unit="посещ."
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="avgSessionTime"
            name="Среднее время сессии"
            stroke={theme.palette.success.main}
            fill={theme.palette.success.light}
            fillOpacity={0.3}
            unit="мин."
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default VisitorsChart;