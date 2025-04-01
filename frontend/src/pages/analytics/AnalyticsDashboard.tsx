import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  GetApp as GetAppIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';

import { RootState } from '../../store';
import { analyticsActions } from '../../store/analytics/analyticsSlice';
import PageHeader from '../../components/PageHeader';
import VisitorsChart from '../../components/analytics/VisitorsChart';
import UserActivityChart from '../../components/analytics/UserActivityChart';
import FilesStatistics from '../../components/analytics/FilesStatistics';
import TestingStatistics from '../../components/analytics/TestingStatistics';
import UserRolesPieChart from '../../components/analytics/UserRolesPieChart';
import DepartmentStatisticsTable from '../../components/analytics/DepartmentStatisticsTable';
import MetricCard from '../../components/analytics/MetricCard';
import ErrorAlert from '../../components/common/ErrorAlert';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsDashboard: React.FC = () => {
  const dispatch = useDispatch();

  const {
    dashboard,
    departmentStats,
    userStats,
    fileStats,
    testingStats,
    loading,
    error
  } = useSelector((state: RootState) => state.analytics);

  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Загрузка данных аналитики
  useEffect(() => {
    loadAnalyticsData();
  }, [dispatch, dateRange, startDate, endDate]);

  // Обработчики действий
  const loadAnalyticsData = () => {
    const dateParams = getDateRangeParams();

    dispatch(analyticsActions.fetchDashboard(dateParams));
    dispatch(analyticsActions.fetchDepartmentStats(dateParams));
    dispatch(analyticsActions.fetchUserStats(dateParams));
    dispatch(analyticsActions.fetchFileStats(dateParams));
    dispatch(analyticsActions.fetchTestingStats(dateParams));
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setDateRange(value);

    // Установка дат на основе выбранного диапазона
    const now = new Date();

    switch (value) {
      case 'today':
        setStartDate(new Date(now.setHours(0, 0, 0, 0)));
        setEndDate(new Date());
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        setStartDate(yesterday);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        setEndDate(yesterdayEnd);
        break;
      case 'last7days':
        const last7days = new Date(now);
        last7days.setDate(last7days.getDate() - 7);
        setStartDate(last7days);
        setEndDate(new Date());
        break;
      case 'last30days':
        const last30days = new Date(now);
        last30days.setDate(last30days.getDate() - 30);
        setStartDate(last30days);
        setEndDate(new Date());
        break;
      case 'thisMonth':
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setEndDate(new Date());
        break;
      case 'lastMonth':
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        setStartDate(firstDayLastMonth);
        setEndDate(lastDayLastMonth);
        break;
      case 'custom':
        // Оставляем текущие даты
        break;
    }
  };

  const handleExportData = () => {
    const dateParams = getDateRangeParams();
    dispatch(analyticsActions.exportAnalyticsData(dateParams));
  };

  // Получение параметров дат
  const getDateRangeParams = () => {
    if (dateRange === 'custom' && startDate && endDate) {
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    }

    return { dateRange };
  };

  // Форматирование диапазона дат для отображения
  const getDateRangeDisplay = () => {
    if (dateRange === 'custom' && startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }

    const dateRangeLabels: Record<string, string> = {
      today: 'Сегодня',
      yesterday: 'Вчера',
      last7days: 'Последние 7 дней',
      last30days: 'Последние 30 дней',
      thisMonth: 'Этот месяц',
      lastMonth: 'Прошлый месяц',
    };

    return dateRangeLabels[dateRange] || 'Выбранный период';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Container maxWidth="lg">
        <PageHeader title="Аналитика и статистика" />

        {error && <ErrorAlert message={error} />}

        {/* Управление периодом и фильтрами */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-range-label">Период</InputLabel>
                <Select
                  labelId="date-range-label"
                  value={dateRange}
                  label="Период"
                  onChange={handleDateRangeChange}
                >
                  <MenuItem value="today">Сегодня</MenuItem>
                  <MenuItem value="yesterday">Вчера</MenuItem>
                  <MenuItem value="last7days">Последние 7 дней</MenuItem>
                  <MenuItem value="last30days">Последние 30 дней</MenuItem>
                  <MenuItem value="thisMonth">Этот месяц</MenuItem>
                  <MenuItem value="lastMonth">Прошлый месяц</MenuItem>
                  <MenuItem value="custom">Произвольный период</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {dateRange === 'custom' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="С"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="По"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                    minDate={startDate || undefined}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={dateRange === 'custom' ? 2 : 8}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Tooltip title="Обновить данные">
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Экспорт данных">
                  <IconButton onClick={handleExportData} disabled={loading}>
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            <DateRangeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            Данные за: {getDateRangeDisplay()}
          </Typography>
        </Paper>

        {/* Ключевые метрики */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Всего пользователей"
              value={dashboard?.totalUsers || 0}
              icon={<PeopleIcon fontSize="large" />}
              change={dashboard?.userChange}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Активных пользователей"
              value={dashboard?.activeUsers || 0}
              icon={<PeopleIcon fontSize="large" />}
              change={dashboard?.activeUserChange}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Всего файлов"
              value={dashboard?.totalFiles || 0}
              icon={<DescriptionIcon fontSize="large" />}
              change={dashboard?.fileChange}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Пройдено тестов"
              value={dashboard?.completedTests || 0}
              icon={<AssignmentIcon fontSize="large" />}
              change={dashboard?.testChange}
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Вкладки с разными видами аналитики */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="analytics tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<TrendingUpIcon />} label="Обзор" />
            <Tab icon={<PeopleIcon />} label="Пользователи" />
            <Tab icon={<DescriptionIcon />} label="Файлы" />
            <Tab icon={<AssignmentIcon />} label="Тестирование" />
          </Tabs>
        </Box>

        {/* Содержимое вкладок */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Посещаемость системы"
                  action={
                    <Tooltip title="Количество уникальных пользователей, посетивших систему в указанный период">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <VisitorsChart data={dashboard?.visits || []} />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Распределение по ролям"
                  action={
                    <Tooltip title="Распределение пользователей по ролям в системе">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <UserRolesPieChart data={dashboard?.userRoles || []} />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Статистика по отделениям"
                  action={
                    <Tooltip title="Использование системы различными отделениями">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DepartmentStatisticsTable data={departmentStats} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Активность пользователей" />
                <Divider />
                <CardContent sx={{ height: 400 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <UserActivityChart data={userStats?.activityByHour || []} />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Топ активных пользователей" />
                <Divider />
                <CardContent sx={{ height: 400 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    userStats?.topActiveUsers && userStats.topActiveUsers.length > 0 ? (
                      <Box>
                        {/* Здесь будет компонент с топом активных пользователей */}
                        <Typography>Реализация списка активных пользователей</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ textAlign: 'center', mt: 8 }} color="text.secondary">
                        Нет данных для отображения
                      </Typography>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Статистика по устройствам" />
                <Divider />
                <CardContent sx={{ height: 400 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    userStats?.deviceStats ? (
                      <Box>
                        {/* Здесь будет компонент со статистикой по устройствам */}
                        <Typography>Реализация диаграммы статистики устройств</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ textAlign: 'center', mt: 8 }} color="text.secondary">
                        Нет данных для отображения
                      </Typography>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Статистика файлов" />
                <Divider />
                <CardContent>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <FilesStatistics data={fileStats} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Статистика тестирования" />
                <Divider />
                <CardContent>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TestingStatistics data={testingStats} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    </LocalizationProvider>
  );
};

export default AnalyticsDashboard;