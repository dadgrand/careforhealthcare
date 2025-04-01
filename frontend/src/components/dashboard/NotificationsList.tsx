import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Divider,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  NotificationsActive as UrgentIcon,
  Description as DocumentIcon,
  Assignment as TestIcon,
  Article as NewsIcon,
  People as UserIcon,
  MoreVert as MoreIcon,
  MarkEmailRead as ReadIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

// Примеры уведомлений
const mockNotifications = [
  {
    id: 'notif-1',
    type: 'document',
    title: 'Документ ожидает верификации',
    message: 'Документ "Протокол №123" ожидает вашей верификации.',
    timestamp: '2023-04-20T10:30:00Z',
    isRead: false,
    isUrgent: true,
    link: '/files/verification',
  },
  {
    id: 'notif-2',
    type: 'test',
    title: 'Новый назначенный тест',
    message: 'Вам назначен тест "Основы оказания первой помощи". Срок выполнения: 05.05.2023.',
    timestamp: '2023-04-18T14:20:00Z',
    isRead: false,
    isUrgent: false,
    link: '/tests/my-assignments',
  },
  {
    id: 'notif-3',
    type: 'news',
    title: 'Опубликована важная новость',
    message: 'Опубликована новость "Обновление протокола лечения пациентов с COVID-19".',
    timestamp: '2023-04-15T09:15:00Z',
    isRead: true,
    isUrgent: false,
    link: '/news/covid-19-protocol-update',
  },
  {
    id: 'notif-4',
    type: 'user',
    title: 'Регистрация подтверждена',
    message: 'Ваша учетная запись подтверждена администратором системы.',
    timestamp: '2023-04-12T16:45:00Z',
    isRead: true,
    isUrgent: false,
    link: '/profile',
  },
];

/**
 * Компонент для отображения списка уведомлений на дашборде
 */
const NotificationsList: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Фильтрация уведомлений в зависимости от активной вкладки
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'urgent') return notification.isUrgent;
    return notification.type === activeTab;
  });

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMin < 60) {
      return `${diffMin} мин. назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч. назад`;
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    }
  };

  // Получение иконки в зависимости от типа уведомления
  const getNotificationIcon = (notificationType: string, isUrgent: boolean) => {
    if (isUrgent) {
      return <UrgentIcon color="error" />;
    }

    switch (notificationType) {
      case 'document':
        return <DocumentIcon color="primary" />;
      case 'test':
        return <TestIcon color="warning" />;
      case 'news':
        return <NewsIcon color="info" />;
      case 'user':
        return <UserIcon color="success" />;
      default:
        return <NotificationIcon color="action" />;
    }
  };

  // Обработчик пометки уведомления как прочитанное
  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  // Обработчик удаления уведомления
  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  // Обработчик пометки всех уведомлений как прочитанные
  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Все" value="all" />
        <Tab label="Непрочитанные" value="unread" />
        <Tab label="Срочные" value="urgent" />
        <Tab label="Документы" value="document" />
        <Tab label="Тесты" value="test" />
        <Tab label="Новости" value="news" />
      </Tabs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<ReadIcon />}
          onClick={handleMarkAllAsRead}
        >
          Отметить все как прочитанные
        </Button>
      </Box>

      {filteredNotifications.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Нет уведомлений
        </Typography>
      ) : (
        <List>
          {filteredNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                alignItems="flex-start"
                sx={{
                  py: 2,
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type, notification.isUrgent)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}
                      >
                        {notification.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {formatDate(notification.timestamp)}
                        </Typography>
                        {notification.isUrgent && (
                          <Chip
                            label="Срочно"
                            size="small"
                            color="error"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        component="div"
                        sx={{ my: 1 }}
                      >
                        {notification.message}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          href={notification.link}
                          endIcon={<ArrowIcon />}
                        >
                          Перейти
                        </Button>
                        <Box>
                          {!notification.isRead && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              sx={{ mr: 1 }}
                            >
                              <ReadIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </React.Fragment>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="text"
          color="primary"
          endIcon={<ArrowIcon />}
          href="/notifications"
        >
          Все уведомления
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationsList;