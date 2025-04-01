import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/authService';
import { User, Department, Specialization, LoginHistory } from '../../types';
import { RootState } from '../index';

// Асинхронные thunk actions для работы с пользователями
export const fetchUsers = createAsyncThunk('user/fetchUsers', async (params?: any, { rejectWithValue }) => {
  try {
    const response = await authApi.getUsers(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Не удалось загрузить пользователей');
  }
});

export const fetchUserById = createAsyncThunk('user/fetchUserById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await authApi.getUser(id);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Не удалось загрузить пользователя');
  }
});

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await authApi.createUser(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Не удалось создать пользователя');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }: { id: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await authApi.updateUser(id, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Не удалось обновить пользователя');
    }
  }
);

export const deleteUser = createAsyncThunk('user/deleteUser', async (id: string, { rejectWithValue }) => {
  try {
    await authApi.deleteUser(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Не удалось удалить пользователя');
  }
});

export const fetchLoginHistory = createAsyncThunk(
  'user/fetchLoginHistory',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await authApi.getLoginHistory(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Не удалось загрузить историю входов');
    }
  }
);

// Интерфейс состояния пользователей
interface UserState {
  users: User[];
  currentUser: User | null;
  departments: Department[];
  specializations: Specialization[];
  loginHistory: LoginHistory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totalCount: number;
}

// Начальное состояние
const initialState: UserState = {
  users: [],
  currentUser: null,
  departments: [],
  specializations: [],
  loginHistory: [],
  status: 'idle',
  error: null,
  totalCount: 0,
};

// Slice для управления пользователями
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Сброс текущего пользователя
    resetCurrentUser: (state) => {
      state.currentUser = null;
    },

    // Установка отделений
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },

    // Установка специализаций
    setSpecializations: (state, action: PayloadAction<Specialization[]>) => {
      state.specializations = action.payload;
    },

    // Сброс статуса и ошибки
    resetUserStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Проверяем, пришел ли массив или объект с пагинацией
        if (Array.isArray(action.payload)) {
          state.users = action.payload;
          state.totalCount = action.payload.length;
        } else if (action.payload.results) {
          state.users = action.payload.results;
          state.totalCount = action.payload.count;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Обработка fetchUserById
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Обработка createUser
    builder
      .addCase(createUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users.push(action.payload);
        state.totalCount += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Обработка updateUser
    builder
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Обработка deleteUser
    builder
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Обработка fetchLoginHistory
    builder
      .addCase(fetchLoginHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLoginHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loginHistory = action.payload;
      })
      .addCase(fetchLoginHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Экспорт actions и селекторов
export const { resetCurrentUser, setDepartments, setSpecializations, resetUserStatus } = userSlice.actions;

export const selectUsers = (state: RootState) => state.user.users;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserError = (state: RootState) => state.user.error;
export const selectTotalCount = (state: RootState) => state.user.totalCount;
export const selectDepartments = (state: RootState) => state.user.departments;
export const selectSpecializations = (state: RootState) => state.user.specializations;
export const selectLoginHistory = (state: RootState) => state.user.loginHistory;

export default userSlice.reducer;