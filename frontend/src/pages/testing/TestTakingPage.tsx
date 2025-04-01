import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepButton,
  Stepper,
  Typography,
  Checkbox,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Flag as FlagIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { RootState } from '../../store';
import { testingActions } from '../../store/testing/testingSlice';
import { formatTimeRemaining } from '../../utils/formatters';
import QuestionCard from '../../components/testing/QuestionCard';
import { Question, QuestionType, TestWithQuestions, UserAnswer } from '../../types/testing';
import ErrorAlert from '../../components/common/ErrorAlert';

const TestTakingPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    currentTest,
    loading,
    error
  } = useSelector((state: RootState) => state.testing);

  // Состояние процесса тестирования
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Диалоги
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarningDialog, setShowTimeWarningDialog] = useState(false);
  const [showExitWarningDialog, setShowExitWarningDialog] = useState(false);

  // Загрузка теста
  useEffect(() => {
    if (id) {
      dispatch(testingActions.fetchTestWithQuestions(Number(id)));
    }
  }, [dispatch, id]);

  // Инициализация таймера при загрузке теста
  useEffect(() => {
    if (currentTest?.timeLimit) {
      setTimeRemaining(currentTest.timeLimit * 60); // Переводим минуты в секунды
    }
  }, [currentTest]);

  // Обработчик таймера
  useEffect(() => {
    if (timeRemaining === null) return;

    if (timeRemaining <= 0) {
      // Время вышло, автоматически отправляем тест
      handleSubmitTest();
      return;
    }

    if (timeRemaining === 60) {
      // Показываем предупреждение за 1 минуту до конца
      setShowTimeWarningDialog(true);
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Вычисление прогресса теста
  const completedSteps = () => Object.keys(completed).length;
  const totalSteps = () => currentTest?.questions.length || 0;
  const progress = Math.round((completedSteps() / totalSteps()) * 100) || 0;

  // Получение текущего вопроса
  const currentQuestion = currentTest?.questions[activeStep];

  // Обработчики навигации
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  // Обработчики ответов
  const handleAnswerChange = (questionId: number, value: UserAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    setCompleted(prev => ({
      ...prev,
      [activeStep]: true
    }));
  };

  // Обработчик флага вопроса
  const handleFlagQuestion = (step: number) => {
    setFlagged(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  // Обработчик отправки теста
  const handleSubmitTest = useCallback(() => {
    if (!currentTest) return;

    const userAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer
    }));

    dispatch(testingActions.submitTest({
      testId: currentTest.id,
      answers: userAnswers,
      timeSpent: currentTest.timeLimit ? (currentTest.timeLimit * 60) - (timeRemaining || 0) : 0
    }));

    // Перенаправляем на страницу результатов
    navigate(`/testing/${currentTest.id}/results`);
  }, [dispatch, currentTest, answers, timeRemaining, navigate]);

  // Предупреждение при попытке покинуть страницу
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (completedSteps() > 0 && completedSteps() < totalSteps()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [completed]);

  // Отображение загрузки
  if (loading && !currentTest) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorAlert message={error} />
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => navigate('/testing')}
        >
          Вернуться к списку тестов
        </Button>
      </Container>
    );
  }

  // Отображение, если тест не найден
  if (!currentTest) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5">Тест не найден</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => navigate('/testing')}
        >
          Вернуться к списку тестов
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            {currentTest.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {timeRemaining !== null && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: timeRemaining < 300 ? 'error.light' : 'background.paper',
                  color: timeRemaining < 300 ? 'error.contrastText' : 'text.primary',
                  animation: timeRemaining < 60 ? 'pulse 1s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  }
                }}
              >
                <TimerIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  {formatTimeRemaining(timeRemaining)}
                </Typography>
              </Box>
            )}

            <Button
              variant="outlined"
              color="error"
              sx={{ ml: 2 }}
              onClick={() => setShowExitWarningDialog(true)}
            >
              Выйти
            </Button>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Прогресс: {completedSteps()} из {totalSteps()} вопросов
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Карточка вопроса */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              answer={answers[currentQuestion.id] || null}
              onAnswerChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              isFlagged={flagged[activeStep] || false}
              onToggleFlag={() => handleFlagQuestion(activeStep)}
            />
          )}

          {/* Кнопки навигации */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
            >
              Назад
            </Button>

            <Button
              variant="contained"
              color={activeStep === totalSteps() - 1 ? 'success' : 'primary'}
              onClick={activeStep === totalSteps() - 1 ? () => setShowSubmitDialog(true) : handleNext}
              disabled={activeStep === totalSteps() - 1 && completedSteps() < totalSteps()}
              endIcon={activeStep === totalSteps() - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
            >
              {activeStep === totalSteps() - 1 ? 'Завершить тест' : 'Далее'}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Панель навигации по вопросам */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Навигация по вопросам
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[...Array(totalSteps())].map((_, index) => (
                <Button
                  key={index}
                  variant={activeStep === index ? 'contained' : 'outlined'}
                  color={
                    flagged[index]
                      ? 'warning'
                      : completed[index]
                        ? 'success'
                        : 'primary'
                  }
                  size="small"
                  onClick={handleStep(index)}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    fontWeight: 'bold',
                    position: 'relative',
                  }}
                >
                  {index + 1}
                  {flagged[index] && (
                    <FlagIcon
                      sx={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        fontSize: 14,
                        color: 'warning.main',
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </Button>
              ))}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Легенда:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: 'primary.main', borderRadius: 1, mr: 1 }} />
                  <Typography variant="body2">Текущий вопрос</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: 'success.main', borderRadius: 1, mr: 1 }} />
                  <Typography variant="body2">Отвеченный вопрос</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: 'warning.main', borderRadius: 1, mr: 1 }} />
                  <Typography variant="body2">Помеченный вопрос</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: 'background.paper', border: '1px solid', borderColor: 'primary.main', borderRadius: 1, mr: 1 }} />
                  <Typography variant="body2">Не отвеченный вопрос</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              color="success"
              fullWidth
              disabled={completedSteps() < totalSteps()}
              onClick={() => setShowSubmitDialog(true)}
              startIcon={<CheckIcon />}
            >
              Завершить тест
            </Button>

            {completedSteps() < totalSteps() && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                Необходимо ответить на все вопросы
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Диалог подтверждения завершения теста */}
      <Dialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
      >
        <DialogTitle>Завершить тест?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите завершить тест и отправить свои ответы?
            {completedSteps() < totalSteps() && (
              <Typography color="error" sx={{ mt: 2 }}>
                Внимание! Вы ответили только на {completedSteps()} из {totalSteps()} вопросов.
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleSubmitTest} color="primary" variant="contained" autoFocus>
            Завершить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог предупреждения о времени */}
      <Dialog
        open={showTimeWarningDialog}
        onClose={() => setShowTimeWarningDialog(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          Время заканчивается!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            У вас осталась 1 минута до окончания времени. Пожалуйста, завершите тест до истечения времени,
            иначе он будет отправлен автоматически.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTimeWarningDialog(false)} color="primary" autoFocus>
            Понятно
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог предупреждения о выходе */}
      <Dialog
        open={showExitWarningDialog}
        onClose={() => setShowExitWarningDialog(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="error" sx={{ mr: 1 }} />
          Выйти из теста?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите выйти из теста? Все ваши ответы будут потеряны.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExitWarningDialog(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={() => navigate('/testing')} color="error">
            Выйти
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TestTakingPage;