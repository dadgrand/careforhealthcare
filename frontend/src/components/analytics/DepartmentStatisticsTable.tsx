import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  LinearProgress,
  Typography,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PeopleAlt as PeopleAltIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { DepartmentStatistics } from '../../types/analytics';

interface DepartmentStatisticsTableProps {
  data: DepartmentStatistics[];
}

// Типы для сортировки
type Order = 'asc' | 'desc';
type OrderBy = keyof DepartmentStatistics | 'testPassRate';

const DepartmentStatisticsTable: React.FC<DepartmentStatisticsTableProps> = ({ data }) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('activeUsers');

  // Вычисление процента прохождения тестов
  const getTestPassRate = (dept: DepartmentStatistics) => {
    if (dept.totalTests === 0) return 0;
    return (dept.passedTests / dept.totalTests) * 100;
  };

  // Функция сортировки
  const sortedData = React.useMemo(() => {
    const stabilizedThis = data.map((el, index) => [el, index] as [DepartmentStatistics, number]);

    stabilizedThis.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (orderBy === 'testPassRate') {
        aValue = getTestPassRate(a[0]);
        bValue = getTestPassRate(b[0]);
      } else {
        aValue = a[0][orderBy];
        bValue = b[0][orderBy];
      }

      if (bValue < aValue) {
        return order === 'asc' ? 1 : -1;
      }
      if (bValue > aValue) {
        return order === 'asc' ? -1 : 1;
      }
      return a[1] - b[1]; // Сохраняем исходный порядок
    });

    return stabilizedThis.map((el) => el[0]);
  }, [data, order, orderBy]);

  // Обработчик изменения сортировки
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Получение иконки тренда
  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUpIcon fontSize="small" color="success" />;
    } else if (value < 0) {
      return <TrendingDownIcon fontSize="small" color="error" />;
    } else {
      return <TrendingFlatIcon fontSize="small" color="disabled" />;
    }
  };

  // Если данных нет
  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography color="text.secondary">
          Нет данных для отображения
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Отделение</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'activeUsers'}
                direction={orderBy === 'activeUsers' ? order : 'asc'}
                onClick={() => handleRequestSort('activeUsers')}
              >
                Активных пользователей
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'totalUsers'}
                direction={orderBy === 'totalUsers' ? order : 'asc'}
                onClick={() => handleRequestSort('totalUsers')}
              >
                Всего пользователей
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'files'}
                direction={orderBy === 'files' ? order : 'asc'}
                onClick={() => handleRequestSort('files')}
              >
                Файлы
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'testPassRate'}
                direction={orderBy === 'testPassRate' ? order : 'asc'}
                onClick={() => handleRequestSort('testPassRate')}
              >
                Тесты
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'activityScore'}
                direction={orderBy === 'activityScore' ? order : 'asc'}
                onClick={() => handleRequestSort('activityScore')}
              >
                Активность
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((dept) => {
            const testPassRate = getTestPassRate(dept);

            return (
              <TableRow key={dept.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {dept.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Tooltip
                      title={`Изменение: ${dept.activeUsersChange > 0 ? '+' : ''}${dept.activeUsersChange}%`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        {getTrendIcon(dept.activeUsersChange)}
                      </Box>
                    </Tooltip>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {dept.activeUsers}
                      </Typography>
                      <Tooltip title="Активные пользователи">
                        <PeopleAltIcon
                          fontSize="small"
                          color="primary"
                          sx={{ ml: 0.5, opacity: 0.7 }}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {dept.totalUsers}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Tooltip
                      title={`Изменение: ${dept.filesChange > 0 ? '+' : ''}${dept.filesChange}%`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        {getTrendIcon(dept.filesChange)}
                      </Box>
                    </Tooltip>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {dept.files}
                      </Typography>
                      <Tooltip title="Файлы">
                        <DescriptionIcon
                          fontSize="small"
                          color="info"
                          sx={{ ml: 0.5, opacity: 0.7 }}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 0.5 }}>
                      <Typography variant="caption">
                        {dept.passedTests} / {dept.totalTests} ({testPassRate.toFixed(0)}%)
                      </Typography>
                      <Tooltip title="Пройденные тесты">
                        <AssignmentIcon
                          fontSize="small"
                          color="success"
                          sx={{ ml: 0.5, opacity: 0.7 }}
                        />
                      </Tooltip>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={testPassRate}
                      sx={{
                        height: 4,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor:
                            testPassRate >= 80 ? 'success.main' :
                            testPassRate >= 60 ? 'warning.main' :
                            'error.main',
                        }
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${dept.activityScore}`}
                    size="small"
                    color={
                      dept.activityScore >= 80 ? 'success' :
                      dept.activityScore >= 60 ? 'primary' :
                      dept.activityScore >= 40 ? 'warning' :
                      'error'
                    }
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DepartmentStatisticsTable;