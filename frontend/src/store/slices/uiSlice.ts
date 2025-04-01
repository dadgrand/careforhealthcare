import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Интерфейс состояния UI
interface UiState {
  sidebarOpen: boolean;
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  currentSection: string;
  error: string | null;
  darkMode: boolean;
  language: string;
}

// Начальное состояние
const initialState: UiState = {
  sidebarOpen: true,
  loading: {
    global: false,
  },
  currentSection: 'dashboard',
  error: null,
  darkMode: false,
  language: 'ru',
};

// Slice для управления UI
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Переключение состояния сайдбара
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    // Установка состояния сайдбара
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Установка загрузки для определенной части приложения
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      const { key, isLoading } = action.payload;
      state.loading[key] = isLoading;
    },

    // Установка глобальной загрузки
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    // Установка текущего раздела
    setCurrentSection: (state, action: PayloadAction<string>) => {
      state.currentSection = action.payload;
    },

    // Установка ошибки
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Переключение темной темы
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },

    // Установка языка
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    // Сброс состояния UI
    resetUi: () => initialState,
  },
});

// Экспорт actions и reducer
export const {
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  setGlobalLoading,
  setCurrentSection,
  setError,
  toggleDarkMode,
  setLanguage,
  resetUi,
} = uiSlice.actions;

export default uiSlice.reducer;