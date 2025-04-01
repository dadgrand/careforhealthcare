import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Компонент для отлова и обработки ошибок в приложении
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Обновление состояния при возникновении ошибки
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логирование ошибки
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Здесь можно добавить отправку ошибки в сервис для мониторинга
  }

  // Обработчик перезагрузки страницы
  handleReload = (): void => {
    window.location.reload();
  };

  // Обработчик возврата на главную страницу
  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    // Если произошла ошибка, показываем интерфейс восстановления
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box mt={8} textAlign="center">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 80 }} />

              <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                Что-то пошло не так
              </Typography>

              <Typography variant="body1" color="textSecondary" paragraph>
                В приложении произошла непредвиденная ошибка. Мы уже работаем над её устранением.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box textAlign="left" sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="error">
                    {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="caption" component="pre" sx={{ mt: 1, overflowX: 'auto' }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Box>
              )}

              <Box mt={4} display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReplayIcon />}
                  onClick={this.handleReload}
                >
                  Перезагрузить страницу
                </Button>
                <Button variant="outlined" color="primary" onClick={this.handleGoHome}>
                  Вернуться на главную
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      );
    }

    // Если ошибки нет, рендерим дочерние компоненты
    return this.props.children;
  }
}