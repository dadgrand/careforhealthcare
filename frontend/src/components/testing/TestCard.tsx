import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Typography,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Assessment as AssessmentIcon,
  AccessTime as AccessTimeIcon,
  TimelapseOutlined as TimelapseIcon,
  HelpOutline as HelpOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { format, isAfter } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Test, TestStatus } from '../../types/testing';
import TestStatusBadge from './TestStatusBadge';

interface TestCardProps {
  test: Test;
  onStart: (id: number) => void;
  onViewResults: (id: number) => void;
}

const TestCard: React.FC<TestCardProps> = ({ test, onStart, onViewResults }) => {
  // Получение информации о времени прохождения
  const getTimeInfo = () => {
    if (!test.dueDate) {
      return 'Без ограничения времени';
    }

    const dueDate = new Date(test.dueDate);
    const isOverdue = isAfter(new Date(), dueDate);

    if (isOverdue) {
      return `Просрочено: ${format(dueDate, 'dd MMM yyyy', { locale: ru })}`;
    } else {
      return `До: ${format(dueDate, 'dd MMM yyyy', { locale: ru })}`;
    }
  };

  // Получение иконки статуса
  const getStatusIcon = () => {
    switch (test.status) {
      case 'passed':
        return <CheckCircleOutlineIcon color="success" />;
      case 'failed':
        return <ErrorOutlineIcon color="error" />;
      case 'pending':
        return <HelpOutlineIcon color="disabled" />;
      case 'assigned':
        return <TimelapseIcon color="primary" />;
      default:
        return <HelpOutlineIcon />;
    }
  };

  // Вычисление текста кнопки действия
  const getActionButtonText = () => {
    switch (test.status) {
      case 'passed':
      case 'failed':
        return 'Просмотр результатов';
      case 'assigned':
      case 'pending':
      default:
        return 'Начать тест';
    }
  };

  // Вычисление иконки кнопки действия
  const getActionButtonIcon = () => {
    switch (test.status) {
      case 'passed':
      case 'failed':
        return <AssessmentIcon />;
      case 'assigned':
      case 'pending':
      default:
        return <PlayArrowIcon />;
    }
  };

  // Обработчик нажатия на кнопку действия
  const handleActionClick = () => {
    if (test.status === 'passed' || test.status === 'failed') {
      onViewResults(test.id);
    } else {
      onStart(test.id);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            {test.category && (
              <Chip
                label={test.category.name}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            )}
          </Box>
          <TestStatusBadge status={test.status} />
        </Box>

        <Typography variant="h6" component="h2" gutterBottom>
          {test.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {test.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FlagIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              {test.questionCount} вопросов
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              {test.timeLimit ? `${test.timeLimit} минут` : 'Без ограничения времени'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelapseIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: test.isOverdue ? 'error.main' : 'text.secondary' }}>
              {getTimeInfo()}
            </Typography>
          </Box>
        </Box>

        {test.attempts && test.maxAttempts && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Попытки: {test.attempts} из {test.maxAttempts}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round((test.attempts / test.maxAttempts) * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(test.attempts / test.maxAttempts) * 100}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}

        {test.lastScore !== undefined && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" align="center">
              Последний результат: {test.lastScore}%
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={getActionButtonIcon()}
          onClick={handleActionClick}
          disabled={test.isOverdue && test.status !== 'passed' && test.status !== 'failed'}
        >
          {getActionButtonText()}
        </Button>
      </CardActions>
    </Card>
  );
};

export default TestCard;