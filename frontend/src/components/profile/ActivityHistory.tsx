import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ActivityEvent } from '../../types/activity';
import { userApi } from '../../services/api/userApi';

interface ActivityHistoryProps {
  userId: number;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ userId }) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

  // Получение иконки в зависимости от типа активности
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LoginIcon />;
      case 'logout':
        return <LogoutIcon />;
      case 'edit':
        return <EditIcon />;
      case 'download':
        return <FileDownloadIcon />;
      case 'upload':
        return <FileUploadIcon />;
      case 'view':
        return <LaunchIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };

  // Получение цвета иконки в зависимости от типа активности
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'success.main';
      case 'logout':
        return 'grey.500';
      case 'edit':
        return 'info.main';
      case 'download':
        return 'primary.main';
      case 'upload':
        return 'secondary.main';
      case 'view':
        return 'grey.700';
      default:
        return 'primary.main';
    }
  };

  // Описание активности
  const getActivityDescription = (activity: ActivityEvent) => {
    switch (activity.type) {
      case 'login':
        return `Вход в систему (${activity.details?.ip || 'неизвестный IP'})`;
      case 'logout':
        return 'Выход из системы';
      case 'edit':
        return `Редактирование ${activity.details?.target || 'информации'}`;
      case 'download':
        return `Скачивание файла: ${activity.details?.filename || 'неизвестный файл'}`;
      case 'upload':
        return `Загрузка файла: ${activity.details?.filename || 'неизвестный файл'}`;
      case 'view':
        return `Просмотр ${activity.details?.target || 'страницы'}`;
      default:
        return activity.description || 'Неизвестное действие';
    }
  };

  // Обработка изменения фильтра
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
    setPage(1);
  };

  // Обработка изменения страницы пагинации
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Загрузка данных активности
  useEffect(() => {
    const fetchActivityHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await userApi.getUserActivityHistory(userId, {
          page,
          limit: 10,
          type: filter !== 'all' ? filter : undefined,
        });

        setActivities(response.data);
        setTotalPages(Math.ceil(response.total / response.limit));
      } catch (err) {
        setError('Не удалось загрузить историю активности');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityHistory();
  }, [userId, page, filter]);

  if (loading && page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">История активности</Typography>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="activity-filter-label">Тип активности</InputLabel>
            <Select
              labelId="activity-filter-label"
              value={filter}
              label="Тип активности"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">Все типы</MenuItem>
              <MenuItem value="login">Вход в систему</MenuItem>
              <MenuItem value="logout">Выход из системы</MenuItem>
              <MenuItem value="edit">Редактирование</MenuItem>
              <MenuItem value="download">Скачивание</MenuItem>
              <MenuItem value="upload">Загрузка</MenuItem>
              <MenuItem value="view">Просмотр</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}

        {activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="textSecondary">
              История активности отсутствует
            </Typography>
          </Box>
        ) : (
          <>
            <List>
              {activities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={getActivityDescription(activity)}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            {format(new Date(activity.timestamp), 'PPp', { locale: ru })}
                          </Typography>
                          {activity.details?.browser && (
                            <Typography
                              component="span"
                              variant="body2"
                              color="textSecondary"
                              sx={{ display: 'block' }}
                            >
                              {`${activity.details.browser} ${activity.details.os || ''}`}
                            </Typography>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ActivityHistory;