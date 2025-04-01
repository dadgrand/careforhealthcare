import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { userActions } from '../../store/user/userSlice';

interface SecuritySettingsProps {
  userId: number;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ userId }) => {
  const dispatch = useDispatch();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionManagementOpen, setSessionManagementOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Обработчики изменения полей
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleTwoFactor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTwoFactorEnabled(e.target.checked);
    // В реальном приложении здесь будет запрос к API для включения/отключения 2FA
  };

  // Обработчик смены пароля
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка совпадения паролей
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    // Проверка сложности пароля
    if (passwordData.newPassword.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // В реальном приложении здесь будет диспатч действия для изменения пароля
      await dispatch(userActions.changePassword({
        userId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }));

      setSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError('Не удалось изменить пароль');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик закрытия всех сессий
  const handleTerminateAllSessions = () => {
    // В реальном приложении здесь будет запрос к API для завершения всех сессий
    alert('Все сессии будут завершены');
  };

  return (
    <Paper elevation={0}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>Безопасность аккаунта</Typography>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Изменение пароля
        </Typography>

        <form onSubmit={handlePasswordSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Текущий пароль"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Новый пароль"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                helperText="Минимум 8 символов, должен содержать буквы и цифры"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Подтверждение пароля"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                error={
                  passwordData.confirmPassword !== '' &&
                  passwordData.newPassword !== passwordData.confirmPassword
                }
                helperText={
                  passwordData.confirmPassword !== '' &&
                  passwordData.newPassword !== passwordData.confirmPassword
                    ? 'Пароли не совпадают'
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Изменить пароль
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ my: 4 }}>
          <Divider />
        </Box>

        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Двухфакторная аутентификация
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={handleToggleTwoFactor}
              />
            }
            label="Включить двухфакторную аутентификацию"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Двухфакторная аутентификация добавляет дополнительный уровень защиты к вашему аккаунту.
            При входе в систему вам потребуется ввести код из SMS или приложения-аутентификатора.
          </Typography>
        </Box>

        <Box sx={{ my: 4 }}>
          <Divider />
        </Box>

        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Управление сессиями
        </Typography>

        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setSessionManagementOpen(true)}
            sx={{ mr: 2 }}
          >
            Просмотр активных сессий
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleTerminateAllSessions}
          >
            Завершить все сессии
          </Button>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Завершение всех сессий приведет к выходу из системы на всех устройствах, кроме текущего.
          </Typography>
        </Box>

        {/* Уведомления об успехе/ошибке */}
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
        >
          <Alert onClose={() => setSuccess(false)} severity="success">
            Пароль успешно изменен
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Paper>
  );
};

export default SecuritySettings;