import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  PlayArrow as StartIcon,
} from '@mui/icons-material';

// Примеры тестов
const mockTests = [
  {
    id: 'test-1',
    title: 'Основы оказания первой помощи',
    due_date: '2023-05-05T23:59:59Z',
    assigned_at: '2023-04-10T10:30:00Z',
    test_details: {
      passing_score: 70,
      time_limit: 30,
      test_type: 'knowledge',
      questions_count: 20,
    },
    status: 'pending',
  },
  {
    id: 'test-2',
    title: 'Протокол работы с пациентами группы риска',
    due_date: '2023-05-10T23:59:59Z',
    assigned_at: '2023-04-12T14:20:00Z',
    test_details: {
      passing_score: 80,
      time_limit: 45,
      test_type: 'certification',
      questions_count: 30,
    },
    status: 'pending',
  },
];

/**
 * Компонент для отображения предстоящих тестов на дашборде
 */
const UpcomingTests: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Расчет оставшегося времени до дедлайна
  const calculateTimeLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Просрочено';
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';

    return `${diffDays} дн.`;
  };

  // Расчет процента прогресса до дедлайна
  const calculateProgress = (assignedDate: string, dueDate: string) => {
    const now = new Date();
    const assigned = new Date(assignedDate);
    const due = new Date(dueDate);

    const totalTime = due.getTime() - assigned.getTime();
    const elapsedTime = now.getTime() - assigned.getTime();

    // Процент прошедшего времени
    let progressPercent = (elapsedTime / totalTime) * 100;

    // Ограничиваем процент от 0 до 100
    progressPercent = Math.min(Math.max(progressPercent, 0), 100);

    return progressPercent;
  };

  // Получение цвета прогресса в зависимости от оставшегося времени
  const getProgressColor = (progressPercent: number) => {
    if (progressPercent < 50) return theme.palette.success.main;
    if (progressPercent < 75) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Получение цвета и текста для типа теста
  const getTestTypeInfo = (testType: string) => {
    switch (testType) {
      case 'knowledge':
        return { color: 'primary', label: 'Знания' };
      case 'certification':
        return { color: 'secondary', label: 'Сертификация' };
      case 'survey':
        return { color: 'info', label: 'Опрос' };
      case 'training':
        return { color: 'success', label: 'Обучение' };
      default:
        return { color: 'default', label: testType };
    }
  };

  // Обработчик начала прохождения теста
  const handleStartTest = (testId: string) => {
    navigate(`/tests/${testId}`);
  };

  // Обработчик перехода к списку всех тестов
  const handleViewAllTests = () => {
    navigate('/tests/my-assignments');
  };

  return (
    <Box>
      {mockTests.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          У вас нет предстоящих тестов
        </Typography>
      ) : (
        <List disablePadding>
          {mockTests.map((test, index) => {
            const progressPercent = calculateProgress(test.assigned_at, test.due_date);
            const progressColor = getProgressColor(progressPercent);
            const timeLeft = calculateTimeLeft(test.due_date);
            const testTypeInfo = getTestTypeInfo(test.test_details.test_type);

            return (
              <React.Fragment key={test.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 2,
                    px: 0,
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" component="div">
                      {test.title}
                    </Typography>
                    <Chip
                      label={testTypeInfo.label}
                      color={testTypeInfo.color as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ width: '100%', mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Срок до: {formatDate(test.due_date)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            timeLeft === 'Просрочено'
                              ? theme.palette.error.main
                              : timeLeft === 'Сегодня' || timeLeft === 'Завтра'
                                ? theme.palette.warning.main
                                : theme.palette.text.secondary,
                          fontWeight:
                            timeLeft === 'Просрочено' ||
                            timeLeft === 'Сегодня' ||
                            timeLeft === 'Завтра'
                              ? 'bold'
                              : 'normal',
                        }}
                      >
                        {timeLeft}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercent}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: progressColor,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" component="span" sx={{ mr: 2 }}>
                        Вопросов: {test.test_details.questions_count}
                      </Typography>
                      <Typography variant="caption" component="span" sx={{ mr: 2 }}>
                        Проходной балл: {test.test_details.passing_score}%
                      </Typography>
                      {test.test_details.time_limit > 0 && (
                        <Typography variant="caption" component="span">
                          Время: {test.test_details.time_limit} мин.
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<StartIcon />}
                      onClick={() => handleStartTest(test.id)}
                    >
                      Начать
                    </Button>
                  </Box>
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="text"
          color="primary"
          endIcon={<ArrowIcon />}
          onClick={handleViewAllTests}
        >
          Все тесты
        </Button>
      </Box>
    </Box>
  );
};

export default UpcomingTests;