import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Divider,
  IconButton,
  useTheme,
  ListSubheader,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  Assignment as TestIcon,
  Article as NewsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  FolderShared as FileManagerIcon,
  Group as UsersIcon,
  SupervisedUserCircle as DepartmentsIcon,
  MedicalInformation as MedicalIcon,
  Support as HelpIcon,
} from '@mui/icons-material';

import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  open: boolean;
}

/**
 * Компонент сайдбара с навигацией
 */
export const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
  open,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isAdminOrManager } = usePermission();

  // Состояние для отслеживания открытых подменю
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    fileManager: false,
    users: false,
    tests: false,
  });

  // Обработчик клика по пункту меню
  const handleNavigation = (path: string) => {
    navigate(path);
    handleDrawerToggle(); // Закрываем меню на мобильных устройствах
  };

  // Обработчик открытия/закрытия подменю
  const handleToggleSubMenu = (key: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Проверка, является ли текущий путь активным
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Общий контент сайдбара
  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 2,
        }}
      >
        <Logo variant="default" withText onClick={() => handleNavigation('/dashboard')} />
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      <Divider />

      <List component="nav" sx={{ pt: 1 }}>
        {/* Главная */}
        <ListItemButton
          selected={isActive('/dashboard')}
          onClick={() => handleNavigation('/dashboard')}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Главная" />
        </ListItemButton>

        {/* Новости */}
        <ListItemButton
          selected={isActive('/news')}
          onClick={() => handleNavigation('/news')}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
          }}
        >
          <ListItemIcon>
            <NewsIcon />
          </ListItemIcon>
          <ListItemText primary="Новости" />
        </ListItemButton>

        {/* Файловый менеджер */}
        <ListItemButton
          onClick={() => handleToggleSubMenu('fileManager')}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
          }}
        >
          <ListItemIcon>
            <FileManagerIcon />
          </ListItemIcon>
          <ListItemText primary="Файлы" />
          {openSubMenus.fileManager ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openSubMenus.fileManager} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
              selected={isActive('/files')}
              onClick={() => handleNavigation('/files')}
            >
              <ListItemText primary="Все файлы" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
              selected={isActive('/files/my')}
              onClick={() => handleNavigation('/files/my')}
            >
              <ListItemText primary="Мои файлы" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
              selected={isActive('/files/shared')}
              onClick={() => handleNavigation('/files/shared')}
            >
              <ListItemText primary="Доступные мне" />
            </ListItemButton>
            {isAdminOrManager() && (
              <ListItemButton
                sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
                selected={isActive('/files/verification')}
                onClick={() => handleNavigation('/files/verification')}
              >
                <ListItemText primary="Верификация" />
              </ListItemButton>
            )}
          </List>
        </Collapse>

        {/* Тесты */}
        <ListItemButton
          onClick={() => handleToggleSubMenu('tests')}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
          }}
        >
          <ListItemIcon>
            <TestIcon />
          </ListItemIcon>
          <ListItemText primary="Тесты" />
          {openSubMenus.tests ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openSubMenus.tests} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
              selected={isActive('/tests')}
              onClick={() => handleNavigation('/tests')}
            >
              <ListItemText primary="Все тесты" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
              selected={isActive('/tests/my-assignments')}
              onClick={() => handleNavigation('/tests/my-assignments')}
            >
              <ListItemText primary="Назначенные мне" />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
              selected={isActive('/tests/my-results')}
              onClick={() => handleNavigation('/tests/my-results')}
            >
              <ListItemText primary="Мои результаты" />
            </ListItemButton>
            {isAdminOrManager() && (
              <ListItemButton
                sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
                selected={isActive('/tests/create')}
                onClick={() => handleNavigation('/tests/create')}
              >
                <ListItemText primary="Создать тест" />
              </ListItemButton>
            )}
          </List>
        </Collapse>

        {/* Документы */}
        <ListItemButton
          selected={isActive('/documents')}
          onClick={() => handleNavigation('/documents')}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
          }}
        >
          <ListItemIcon>
            <DocumentIcon />
          </ListItemIcon>
          <ListItemText primary="Документы" />
        </ListItemButton>

        {/* Медицинская информация */}
        <ListItemButton
          selected={isActive('/medical')}
          onClick={() => handleNavigation('/medical')}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
          }}
        >
          <ListItemIcon>
            <MedicalIcon />
          </ListItemIcon>
          <ListItemText primary="Медицинская информация" />
        </ListItemButton>

        {/* Профиль */}
        <ListItemButton
          selected={isActive('/profile')}
          onClick={() => handleNavigation('/profile')}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
          }}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Мой профиль" />
        </ListItemButton>
      </List>

      <Divider />

      {/* Администрирование (только для админов и менеджеров) */}
      {isAdminOrManager() && (
        <>
          <List
            component="nav"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                Администрирование
              </ListSubheader>
            }
          >
            {/* Управление пользователями */}
            <ListItemButton
              onClick={() => handleToggleSubMenu('users')}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon>
                <UsersIcon />
              </ListItemIcon>
              <ListItemText primary="Пользователи" />
              {openSubMenus.users ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openSubMenus.users} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
                  selected={isActive('/admin/users')}
                  onClick={() => handleNavigation('/admin/users')}
                >
                  <ListItemText primary="Все пользователи" />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
                  selected={isActive('/admin/departments')}
                  onClick={() => handleNavigation('/admin/departments')}
                >
                  <ListItemText primary="Отделения" />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: 1, mx: 1, mb: 0.5 }}
                  selected={isActive('/admin/specializations')}
                  onClick={() => handleNavigation('/admin/specializations')}
                >
                  <ListItemText primary="Специализации" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Аналитика */}
            <ListItemButton
              selected={isActive('/admin/analytics')}
              onClick={() => handleNavigation('/admin/analytics')}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon>
                <AnalyticsIcon />
              </ListItemIcon>
              <ListItemText primary="Аналитика" />
            </ListItemButton>

            {/* Системные настройки (только для админов) */}
            {isAdmin() && (
              <ListItemButton
                selected={isActive('/admin/settings')}
                onClick={() => handleNavigation('/admin/settings')}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Системные настройки" />
              </ListItemButton>
            )}
          </List>

          <Divider />
        </>
      )}

      {/* Помощь и поддержка */}
      <List component="nav">
        <ListItemButton
          selected={isActive('/help')}
          onClick={() => handleNavigation('/help')}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
          }}
        >
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Помощь и поддержка" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: open ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
    >
      {/* Мобильная версия drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Лучшая производительность на мобильных
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Десктопная версия drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};