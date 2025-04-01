import React from 'react';
import { Box, Grid, Paper, Typography, Button, Divider, Card, CardContent, CardActions } from '@mui/material';
import {
  Article as NewsIcon,
  InsertDriveFile as FileIcon,
  AssignmentTurnedIn as TestIcon,
  Person as PersonIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';

import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import RecentNews from '../components/dashboard/RecentNews';
import UpcomingTests from '../components/dashboard/UpcomingTests';
import RecentFiles from '../components/dashboard/RecentFiles';
import ActivityChart from '../components/dashboard/ActivityChart';
import NotificationsList from '../components/dashboard/NotificationsList';

/**
 * Страница дашборда
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`Добро пожаловать, ${user?.first_name || 'Пользователь'}!`}
        subtitle="Панель управления"
        breadcrumbs={[{ label: 'Главная', link: '/dashboard' }]}
      />

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Непрочитанные новости"
            value="3"
            icon={<NewsIcon />}
            color="primary"
            trend={{
              value: 5,
              label: 'новых за неделю',
            }}
            link="/news"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Файлы на проверку"
            value="7"
            icon={<FileIcon />}
            color="info"
            trend={{
              value: -2,
              label: 'меньше чем вчера',
              direction: 'down',
            }}
            link="/files"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Назначенные тесты"
            value="2"
            icon={<TestIcon />}
            color="warning"
            trend={{
              value: 0,
              label: 'как и в прошлом месяце',
            }}
            link="/tests/my-assignments"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Уведомления"
            value="4"
            icon={<NotificationIcon />}
            color="success"
            trend={{
              value: 2,
              label: 'новых сегодня',
            }}
          />
        </Grid>
      </Grid>

      {/* Приветствие и профиль пользователя */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Обзор деятельности
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ActivityChart />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Мой профиль</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ф.И.О.
                </Typography>
                <Typography variant="body1">
                  {user?.last_name} {user?.first_name} {user?.patronymic || ''}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Должность
                </Typography>
                <Typography variant="body1">
                  {user?.role === 'doctor' && 'Врач'}
                  {user?.role === 'nurse' && 'Медсестра'}
                  {user?.role === 'admin' && 'Администратор'}
                  {user?.role === 'manager' && 'Руководитель'}
                  {user?.role === 'staff' && 'Сотрудник'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Отделение
                </Typography>
                <Typography variant="body1">
                  {user?.department_details?.name || 'Не указано'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Специализация
                </Typography>
                <Typography variant="body1">
                  {user?.specialization_details?.name || 'Не указано'}
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" href="/profile">
                Перейти в профиль
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Недавние события и задачи */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Последние новости
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <RecentNews />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Предстоящие тесты
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <UpcomingTests />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Недавние файлы
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <RecentFiles />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Уведомления
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <NotificationsList />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardPage;