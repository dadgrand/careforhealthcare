import { useSnackbar, VariantType } from 'notistack';

/**
 * Хук для работы с уведомлениями
 */
export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  /**
   * Отображает уведомление
   * @param message Текст уведомления
   * @param variant Тип уведомления (success, error, warning, info)
   * @param options Дополнительные опции
   */
  const showNotification = (
    message: string,
    variant: VariantType = 'default',
    options: Record<string, any> = {}
  ) => {
    return enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      ...options,
    });
  };

  /**
   * Отображает успешное уведомление
   * @param message Текст уведомления
   * @param options Дополнительные опции
   */
  const showSuccess = (message: string, options: Record<string, any> = {}) => {
    return showNotification(message, 'success', options);
  };

  /**
   * Отображает уведомление об ошибке
   * @param message Текст уведомления
   * @param options Дополнительные опции
   */
  const showError = (message: string, options: Record<string, any> = {}) => {
    return showNotification(message, 'error', options);
  };

  /**
   * Отображает предупреждающее уведомление
   * @param message Текст уведомления
   * @param options Дополнительные опции
   */
  const showWarning = (message: string, options: Record<string, any> = {}) => {
    return showNotification(message, 'warning', options);
  };

  /**
   * Отображает информационное уведомление
   * @param message Текст уведомления
   * @param options Дополнительные опции
   */
  const showInfo = (message: string, options: Record<string, any> = {}) => {
    return showNotification(message, 'info', options);
  };

  /**
   * Обрабатывает ошибку API и отображает соответствующее уведомление
   * @param error Объект ошибки
   * @param defaultMessage Сообщение по умолчанию
   */
  const handleApiError = (error: any, defaultMessage: string = 'Произошла ошибка при выполнении запроса') => {
    console.error('API Error:', error);

    let errorMessage = defaultMessage;

    if (error.response) {
      // Запрос был выполнен, сервер вернул статус код, отличный от 2xx
      const responseData = error.response.data;

      if (responseData.detail) {
        errorMessage = responseData.detail;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData.errors) {
        // Обработка валидационных ошибок
        const errors = responseData.errors;
        const firstErrorField = Object.keys(errors)[0];

        if (firstErrorField && errors[firstErrorField].length > 0) {
          errorMessage = `${firstErrorField}: ${errors[firstErrorField][0]}`;
        }
      }
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      errorMessage = 'Сервер не отвечает. Пожалуйста, попробуйте позже.';
    } else {
      // Ошибка при настройке запроса
      errorMessage = error.message || defaultMessage;
    }

    showError(errorMessage);
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    handleApiError,
    closeSnackbar,
  };
};