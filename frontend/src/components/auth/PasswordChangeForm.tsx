import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { authApi } from '../../services/authService';

// Интерфейс для данных формы
interface PasswordChangeFormInputs {
  old_password: string;
  new_password: string;
  new_password2: string;
}

// Схема валидации с yup
const validationSchema = yup.object().shape({
  old_password: yup.string().required('Текущий пароль обязателен для заполнения'),
  new_password: yup
    .string()
    .required('Новый пароль обязателен для заполнения')
    .min(8, 'Пароль должен содержать не менее 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру'
    ),
  new_password2: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
});

/**
 * Компонент формы смены пароля
 */
const PasswordChangeForm: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, handleApiError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Инициализация react-hook-form с валидацией
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormInputs>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      new_password2: '',
    },
  });

  // Обработчик отправки формы
  const onSubmit = async (data: PasswordChangeFormInputs) => {
    if (!user) return;

    setLoading(true);
    try {
      await authApi.changePassword(user.id, data);
      showSuccess('Пароль успешно изменен');
      reset(); // Сбрасываем форму после успешной смены пароля
    } catch (error) {
      handleApiError(error, 'Ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  // Обработчики переключения видимости паролей
  const handleToggleOldPasswordVisibility = () => {
    setShowOldPassword((prev) => !prev);
  };

  const handleToggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Изменение пароля
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Для смены пароля введите ваш текущий пароль и новый пароль дважды
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="old_password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="old_password"
                label="Текущий пароль"
                type={showOldPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={!!errors.old_password}
                helperText={errors.old_password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleToggleOldPasswordVisibility}
                        edge="end"
                      >
                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="new_password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="new_password"
                label="Новый пароль"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                error={!!errors.new_password}
                helperText={errors.new_password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleToggleNewPasswordVisibility}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="new_password2"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="new_password2"
                label="Подтверждение нового пароля"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                error={!!errors.new_password2}
                helperText={errors.new_password2?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              sx={{ mr: 2 }}
              onClick={() => reset()}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Сменить пароль'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;