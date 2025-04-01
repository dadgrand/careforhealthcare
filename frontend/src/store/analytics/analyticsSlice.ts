import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { analyticsApi } from '../../services/api/analyticsApi';
import {
  AnalyticsState,
  AnalyticsDateParams,
  DashboardData,
  DepartmentStatistics,
  UserStatistics,
  FileStatistics,
  TestingStatistics,
} from '../../types/analytics';

// Начальное состояние
const initialState: AnalyticsState = {
  dashboard: null,
  departmentStats: [],
  userStats: null,
  fileStats: null,
  testingStats: null,
  loading: false,
  error: null,
};

// Асинхронные действия
export const fetchDashboard = createAsyncThunk(
  'analytics/fetchDashboard',
  async (params: AnalyticsDateParams, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getDashboardData(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить данные дашборда');
    }
  }
);

export const fetchDepartmentStats = createAsyncThunk(
  'analytics/fetchDepartmentStats',
  async (params: AnalyticsDateParams, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getDepartmentStatistics(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить статистику отделений');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'analytics/fetchUserStats',
  async (params: AnalyticsDateParams, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getUserStatistics(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить статистику пользователей');
    }
  }
);

export const fetchFileStats = createAsyncThunk(
  'analytics/fetchFileStats',
  async (params: AnalyticsDateParams, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getFileStatistics(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить статистику файлов');
    }
  }
);

export const fetchTestingStats = createAsyncThunk(
  'analytics/fetchTestingStats',
  async (params: AnalyticsDateParams, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getTestingStatistics(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить статистику тестирования');
    }
  }
);

export const exportAnalyticsData = createAsyncThunk(
  'analytics/exportData',
  async (params: AnalyticsDateParams, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.exportAnalyticsData(params);

      // Create and download file
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось экспортировать данные');
    }
  }
);

// Создание slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard data
    builder.addCase(fetchDashboard.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboard.fulfilled, (state, action: PayloadAction<DashboardData>) => {
      state.loading = false;
      state.dashboard = action.payload;
    });
    builder.addCase(fetchDashboard.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Department statistics
    builder.addCase(fetchDepartmentStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDepartmentStats.fulfilled, (state, action: PayloadAction<DepartmentStatistics[]>) => {
      state.loading = false;
      state.departmentStats = action.payload;
    });
    builder.addCase(fetchDepartmentStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // User statistics
    builder.addCase(fetchUserStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserStats.fulfilled, (state, action: PayloadAction<UserStatistics>) => {
      state.loading = false;
      state.userStats = action.payload;
    });
    builder.addCase(fetchUserStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // File statistics
    builder.addCase(fetchFileStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFileStats.fulfilled, (state, action: PayloadAction<FileStatistics>) => {
      state.loading = false;
      state.fileStats = action.payload;
    });
    builder.addCase(fetchFileStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Testing statistics
    builder.addCase(fetchTestingStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestingStats.fulfilled, (state, action: PayloadAction<TestingStatistics>) => {
      state.loading = false;
      state.testingStats = action.payload;
    });
    builder.addCase(fetchTestingStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Export data
    builder.addCase(exportAnalyticsData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(exportAnalyticsData.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(exportAnalyticsData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Экспорт actions и reducer
export const { clearAnalyticsErrors } = analyticsSlice.actions;

export const analyticsActions = {
  fetchDashboard,
  fetchDepartmentStats,
  fetchUserStats,
  fetchFileStats,
  fetchTestingStats,
  exportAnalyticsData,
  clearAnalyticsErrors,
};

export default analyticsSlice.reducer;