import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import fileReducer from './slices/fileSlice';
import newsReducer from './slices/newsSlice';
import testReducer from './slices/testSlice';
import uiReducer from './slices/uiSlice';

// Конфигурация Redux Store
export const store = configureStore({
  reducer: {
    user: userReducer,
    file: fileReducer,
    news: newsReducer,
    test: testReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем нессериализуемые значения в определенных путях
        ignoredActions: ['file/uploadFile/fulfilled', 'file/downloadFile/fulfilled'],
        ignoredPaths: ['file.currentFile.file', 'file.downloadData'],
      },
    }),
});

// Типы для стора
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;