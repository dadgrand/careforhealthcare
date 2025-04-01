import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';

interface TestResultChartProps {
  correctCount: number;
  incorrectCount: number;
  passingScore: number;
  score: number;
}

const TestResultChart: React.FC<TestResultChartProps> = ({
  correctCount,
  incorrectCount,
  passingScore,
  score,
}) => {
  const theme = useTheme();

  // Цвета для диаграммы
  const COLORS = [
    theme.palette.success.main,
    theme.palette.error.light,
  ];

  // Данные для диаграммы
  const data = [
    { name: 'Правильно', value: correctCount },
    { name: 'Неправильно', value: incorrectCount },
  ];

  // Пользовательский компонент всплывающей подсказки
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="body2" fontWeight="bold" color={payload[0].payload.color}>
            {payload[0].name}: {payload[0].value} вопросов
          </Typography>
        </Box>
      );
    }

    return null;
  };

  // Если нет данных
  if (correctCount === 0 && incorrectCount === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Typography color="text.secondary">
          Нет данных для отображения
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Основная круговая диаграмма */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
              />
            ))}
            {/* Метка в центре */}
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox as { cx: number; cy: number };
                return (
                  <g>
                    <text
                      x={cx}
                      y={cy - 5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        fill: score >= passingScore
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                      }}
                    >
                      {score}%
                    </text>
                    <text
                      x={cx}
                      y={cy + 20}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontSize: '12px',
                        fill: theme.palette.text.secondary,
                      }}
                    >
                      {score >= passingScore ? 'Пройдено' : 'Не пройдено'}
                    </text>
                  </g>
                );
              }}
            />
          </Pie>
          {/* Вторая круговая диаграмма (маркер проходного балла) */}
          <Pie
            data={[
              { name: 'passing', value: passingScore },
              { name: 'remainder', value: 100 - passingScore },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={88}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            <Cell
              fill={theme.palette.warning.main}
              stroke="none"
            />
            <Cell
              fill="transparent"
              stroke="none"
            />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Легенда */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mt: 2,
        }}
      >
        {data.map((entry, index) => (
          <Box
            key={index}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: COLORS[index],
                borderRadius: '50%',
                mr: 1,
              }}
            />
            <Typography variant="body2">
              {entry.name}: {entry.value} ({Math.round((entry.value / (correctCount + incorrectCount)) * 100)}%)
            </Typography>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: theme.palette.warning.main,
              borderRadius: '50%',
              mr: 1,
            }}
          />
          <Typography variant="body2">
            Проходной балл: {passingScore}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TestResultChart;