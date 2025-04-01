import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  PlayArrow as PlayArrowIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { RootState } from '../../store';
import { testingActions } from '../../store/testing/testingSlice';
import { Test, TestStatus } from '../../types/testing';
import PageHeader from '../../components/PageHeader';
import TestCard from '../../components/testing/TestCard';
import TestStatusBadge from '../../components/testing/TestStatusBadge';
import TestFilters from '../../components/testing/TestFilters';

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
      id={`testing-tabpanel-${index}`}
      aria-labelledby={`testing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TestingPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    tests,
    categories,
    loading,
    error
  } = useSelector((state: RootState) => state.testing);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    dueDate: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Загрузка тестов и категорий
  useEffect(() => {
    dispatch(testingActions.fetchTestCategories());
    dispatch(testingActions.fetchTests({
      search: searchQuery,
      filters,
    }));
  }, [dispatch, searchQuery, filters]);

  // Обработчики действий
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    // Фильтрация по табам
    const statusMap: Record<number, string> = {
      0: '', // Все
      1: 'assigned', // Назначенные
      2: 'passed', // Пройденные
      3: 'failed', // Не пройденные
      4: 'pending', // Ожидающие
    };

    setFilters(prev => ({
      ...prev,
      status: statusMap[newValue] || '',
    }));
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestStart = (testId: number) => {
    navigate(`/testing/${testId}`);
  };

  const handleTestResults = (testId: number) => {
    navigate(`/testing/${testId}/results`);
  };

  // Фильтрация тестов
  const filterTests = (tests: Test[]) => {
    return tests.filter(test => {
      // Фильтр по поиску
      if (searchQuery && !test.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Фильтр по категории
      if (filters.category && test.category?.id.toString() !== filters.category) {
        return false;
      }

      // Фильтр по дате
      if (filters.dueDate) {
        if (filters.dueDate === 'overdue' && !test.isOverdue) {
          return false;
        } else if (filters.dueDate === 'upcoming' && test.isOverdue) {
          return false;
        }
      }

      return true;
    });
  };

  // Фильтрованные тесты
  const filteredTests = filterTests(tests);

  return (
    <Container maxWidth="lg">
      <PageHeader title="Система тестирования" />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Поиск тестов..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ mr: 1 }}
                >
                  Фильтры
                </Button>

                <Button
                  variant="contained"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/testing/my-assignments')}
                >
                  Мои назначения
                </Button>
              </Box>
            </Grid>
          </Grid>

          {showFilters && (
            <TestFilters
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="test status tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Все тесты" />
          <Tab label="Назначенные" />
          <Tab label="Пройденные" />
          <Tab label="Не пройденные" />
          <Tab label="Ожидают прохождения" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {renderTestList()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderTestList()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderTestList()}
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        {renderTestList()}
      </TabPanel>
      <TabPanel value={activeTab} index={4}>
        {renderTestList()}
      </TabPanel>
    </Container>
  );

  function renderTestList() {
    if (loading && tests.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (filteredTests.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography color="textSecondary">
            {searchQuery || Object.values(filters).some(Boolean)
              ? 'Не найдено тестов, соответствующих критериям поиска'
              : 'Нет доступных тестов'}
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {filteredTests.map((test) => (
          <Grid item xs={12} sm={6} md={4} key={test.id}>
            <TestCard
              test={test}
              onStart={handleTestStart}
              onViewResults={handleTestResults}
            />
          </Grid>
        ))}
      </Grid>
    );
  }
};

export default TestingPage;