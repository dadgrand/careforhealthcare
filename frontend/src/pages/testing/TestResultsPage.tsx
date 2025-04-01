import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Timer as TimerIcon,
  InsertChartOutlined as ChartIcon,
  EmojiEvents as TrophyIcon,
  Help as HelpIcon,
  StarOutline as StarOutlineIcon,
  StarRate as StarRateIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';

import { RootState } from '../../store';
import { testingActions } from '../../store/testing/testingSlice';
import { formatElapsedTime } from '../../utils/formatters';
import { TestResult, QuestionResult } from '../../types/testing';
import PageHeader from '../../components/PageHeader';
import ErrorAlert from '../../components/common/ErrorAlert';
import TestResultChart from '../../components/testing/TestResultChart';

const TestResultsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    currentTestResult,
    loading,
    error
  } = useSelector((state: RootState) => state.testing);

  const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false);

  // Загрузка результатов теста
  useEffect(() => {
    if (id) {
      dispatch(testingActions.fetchTestResults(Number(id)));
    }
  }, [dispatch, id]);

  // Обработчики действий
  const handleBack = () => {
    navigate('/testing');
  };

  const handleRetakeTest = () => {
    if (id) {
      navigate(`/testing/${id}`);
    }
  };

  const handleExpandQuestion = (questionId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedQuestion(isExpanded ? questionId : false);
  };

  // Отображение загрузки
  if (loading && !currentTestResult) {
    return (
      <Container maxWidth="lg">
        <PageHeader title="Результаты теста" />
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <Container maxWidth="lg">
        <PageHeader title="Результаты теста" />
        <ErrorAlert message={error} />
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={handleBack}
        >
          Вернуться к списку тестов
        </Button>
      </Container>
    );
  }

  // Отображение, если результаты не найдены
  if (!currentTestResult) {
    return (
      <Container maxWidth="lg">
        <PageHeader title="Результаты теста" />
        <Typography variant="h5">Результаты не найдены</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={handleBack}
        >
          Вернуться к списку тестов
        </Button>
      </Container>
    );
  }

  // Расчет статистики
  const correctAnswers = currentTestResult.questions.filter(q => q.isCorrect).length;
  const totalQuestions = currentTestResult.questions.length;
  const percentScore = Math.round((correctAnswers / totalQuestions) * 100);
  const isPassed = percentScore >= (currentTestResult.test.passingScore || 70);

  return (
    <Container maxWidth="lg">
      <PageHeader title="Результаты теста" />

      <Button
        startIcon={<ArrowBackIcon />}
        variant="outlined"
        sx={{ mb: 3 }}
        onClick={handleBack}
      >
        Вернуться к списку тестов
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Основная информация о результатах */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {currentTestResult.test.title}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isPassed ? 'success.light' : 'error.light',
                      color: isPassed ? 'success.contrastText' : 'error.contrastText',
                      borderRadius: '50%',
                      width: 100,
                      height: 100,
                      mr: 2,
                    }}
                  >
                    <Typography variant="h4">
                      {percentScore}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color={isPassed ? 'success.main' : 'error.main'}>
                      {isPassed ? 'Тест пройден' : 'Тест не пройден'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Результат: {correctAnswers} из {totalQuestions} вопросов
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Проходной балл: {currentTestResult.test.passingScore || 70}%
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Затраченное время: {formatElapsedTime(currentTestResult.timeSpent)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StarRateIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Попытка: {currentTestResult.attemptNumber} из {currentTestResult.test.maxAttempts || '∞'}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Дата прохождения: {new Date(currentTestResult.completedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {currentTestResult.test.maxAttempts &&
               currentTestResult.attemptNumber < currentTestResult.test.maxAttempts &&
               !isPassed && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReplayIcon />}
                  onClick={handleRetakeTest}
                  sx={{ mt: 2 }}
                >
                  Пройти тест снова
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Детальные результаты по вопросам */}
          <Typography variant="h6" gutterBottom>
            Детальные результаты
          </Typography>

          {currentTestResult.questions.map((question, index) => (
            <Accordion
              key={`question-${question.id}`}
              expanded={expandedQuestion === question.id.toString()}
              onChange={handleExpandQuestion(question.id.toString())}
              sx={{
                mb: 2,
                border: '1px solid',
                borderColor: question.isCorrect ? 'success.light' : 'error.light',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: question.isCorrect ? 'success.light' : 'error.light',
                  color: question.isCorrect ? 'success.contrastText' : 'error.contrastText',
                  '&:hover': {
                    bgcolor: question.isCorrect ? 'success.light' : 'error.light',
                    opacity: 0.9
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {question.isCorrect ? (
                    <CheckIcon sx={{ mr: 1 }} />
                  ) : (
                    <CloseIcon sx={{ mr: 1 }} />
                  )}
                  <Typography variant="subtitle1" sx={{ flex: 1 }}>
                    Вопрос {index + 1}: {question.text.length > 50 ? `${question.text.substring(0, 50)}...` : question.text}
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2">
                      {question.points} {question.points === 1 ? 'балл' :
                        question.points > 1 && question.points < 5 ? 'балла' : 'баллов'}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {question.text}
                  </Typography>

                  {question.type === 'single_choice' && renderSingleChoiceAnswer(question)}
                  {question.type === 'multiple_choice' && renderMultipleChoiceAnswer(question)}
                  {question.type === 'text' && renderTextAnswer(question)}

                  {question.explanation && (
                    <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Пояснение:
                      </Typography>
                      <Typography variant="body2">
                        {question.explanation}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Статистика и графики */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Сводка
              </Typography>

              <Box sx={{ height: 260, mb: 2 }}>
                <TestResultChart
                  correctCount={correctAnswers}
                  incorrectCount={totalQuestions - correctAnswers}
                  passingScore={currentTestResult.test.passingScore || 70}
                  score={percentScore}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <List disablePadding>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Правильные ответы"
                    secondary={`${correctAnswers} из ${totalQuestions} (${percentScore}%)`}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CloseIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Неправильные ответы"
                    secondary={`${totalQuestions - correctAnswers} из ${totalQuestions} (${100 - percentScore}%)`}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TimerIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Среднее время на вопрос"
                    secondary={`${Math.round(currentTestResult.timeSpent / totalQuestions)} сек.`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Сравнение с другими результатами */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Сравнение
              </Typography>

              <List disablePadding>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TrophyIcon sx={{ color: 'gold' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ваш лучший результат"
                    secondary={`${currentTestResult.bestScore}% (попытка ${currentTestResult.bestAttempt})`}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ChartIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Средний результат по всем"
                    secondary={`${currentTestResult.averageScore}%`}
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <StarRateIcon sx={{ color: 'orange' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ваш результат относительно других"
                    secondary={`Лучше чем у ${currentTestResult.percentile}% участников`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  // Рендер ответов разных типов
  function renderSingleChoiceAnswer(question: QuestionResult) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Варианты ответов:
        </Typography>
        <List disablePadding>
          {question.options?.map((option) => {
            const isUserAnswer = question.userAnswer?.type === 'single' &&
                               question.userAnswer.optionId === option.id;
            const isCorrectAnswer = option.isCorrect;

            return (
              <ListItem
                key={option.id}
                sx={{
                  bgcolor: isUserAnswer && isCorrectAnswer ? 'success.light' :
                          isUserAnswer && !isCorrectAnswer ? 'error.light' :
                          isCorrectAnswer ? 'success.light' : 'transparent',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  {isUserAnswer && isCorrectAnswer && <CheckIcon color="success" />}
                  {isUserAnswer && !isCorrectAnswer && <CloseIcon color="error" />}
                  {!isUserAnswer && isCorrectAnswer && <CheckIcon color="success" />}
                  {!isUserAnswer && !isCorrectAnswer && (
                    <Radio
                      checked={isUserAnswer}
                      disableRipple
                      disabled
                    />
                  )}
                </ListItemIcon>
                <ListItemText primary={option.text} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  }

  function renderMultipleChoiceAnswer(question: QuestionResult) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Варианты ответов:
        </Typography>
        <List disablePadding>
          {question.options?.map((option) => {
            const isUserAnswer = question.userAnswer?.type === 'multiple' &&
                               question.userAnswer.optionIds.includes(option.id);
            const isCorrectAnswer = option.isCorrect;

            return (
              <ListItem
                key={option.id}
                sx={{
                  bgcolor: isUserAnswer && isCorrectAnswer ? 'success.light' :
                          isUserAnswer && !isCorrectAnswer ? 'error.light' :
                          !isUserAnswer && isCorrectAnswer ? 'warning.light' : 'transparent',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={isUserAnswer}
                    disableRipple
                    disabled
                  />
                </ListItemIcon>
                <ListItemText primary={option.text} />
                {isCorrectAnswer && !isUserAnswer && (
                  <Tooltip title="Вы пропустили правильный ответ">
                    <HelpIcon color="warning" />
                  </Tooltip>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  }

  function renderTextAnswer(question: QuestionResult) {
    const userAnswer = question.userAnswer?.type === 'text' ? question.userAnswer.text : '';

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Ваш ответ:
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography>
            {userAnswer || <em>Нет ответа</em>}
          </Typography>
        </Paper>

        <Typography variant="subtitle2" gutterBottom>
          Правильный ответ:
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
          <Typography>
            {question.correctAnswer || <em>Нет правильного ответа</em>}
          </Typography>
        </Paper>
      </Box>
    );
  }
};

export default TestResultsPage;