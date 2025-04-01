import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { toggleSidebar } from '../store/slices/uiSlice';
import { RootState } from '../store';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Основной макет для приложения с сайдбаром, хедером и футером
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isSmScreen = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();

  // Получаем состояние сайдбара из Redux
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  // Локальное состояние для мобильной версии сайдбара
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ширина сайдбара
  const drawerWidth = 260;

  // Обработчик переключения сайдбара для мобильных устройств
  const handleDrawerToggle = () => {
    if (isSmScreen) {
      setMobileOpen(!mobileOpen);
    } else {
      dispatch(toggleSidebar());
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Сайдбар */}
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        open={sidebarOpen}
      />

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Хедер */}
        <Header handleDrawerToggle={handleDrawerToggle} />

        {/* Основной контент */}
        <Box
          component="div"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: 'background.default',
          }}
        >
          {children}
        </Box>

        {/* Футер */}
        <Footer />
      </Box>
    </Box>
  );
};