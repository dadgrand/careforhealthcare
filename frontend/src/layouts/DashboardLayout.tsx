import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  FolderOpen as FolderIcon,
  Newspaper as NewspaperIcon,
  Assignment as AssignmentIcon,
  Insights as InsightsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

import { RootState } from '../store';
import { authActions } from '../store/auth/authSlice';
import { notificationActions } from '../store/notification/notificationSlice';

// Ширина бокового меню
const drawerWidth = 240;

/**
 * Основной макет дашборда с боковым меню и верхней панелью.
 */
const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { currentUser } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector((state: RootState) => state.notification);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationMenuAnchorEl, setNotificationMenuAnchorEl] = useState<null | HTMLElement>(null);

  const userMenuOpen = Boolean(userMenuAnchorEl);
  const notificationMenuOpen = Boolean(notificationMenuAnchorEl);

  // Загрузка уведомлений при монтировании компонента
  useEffect(() => {
    dispatch(notificationActions.fetchNotifications());
  }, [dispatch]);

  // Обработчики событий
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchorEl(event.currentTarget);
    // Отмечаем уведомления как прочитанные
    dispatch(notificationActions.markNotificationsAsRead());
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    dispatch(authActions.logout());
    navigate('/auth/login');
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    if (currentUser) {
      navigate(`/dashboard/profile/${currentUser.id}`);
    }
  };

  const handleSettingsClick = () => {
    handleUserMenuClose();
    navigate('/dashboard/settings');
  };

  const handleNotificationClick = (notificationId: number, link?: string) => {
    handleNotificationMenuClose();
    dispatch(notificationActions.markNotificationAsRead(notificationId));

    if (link) {
      navigate(link);
    }
  };

  // Элементы навигации бокового меню
  const navigationItems = [
    {
      text: 'Дашборд',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'manager', 'doctor', 'nurse', 'staff'],
    },
    {
      text: 'Пользователи',
      icon: <PeopleIcon />,
      path: '/dashboard/users',
      roles: ['admin', 'manager'],
    },
    {
      text: 'Файлы',
      icon: <FolderIcon />,
      path: '/dashboard/files',
      roles: ['admin', 'manager', 'doctor', 'nurse', 'staff'],
    },
    {
      text: 'Новости',
      icon: <NewspaperIcon />,
      path: '/dashboard/news-management',
      roles: ['admin', 'editor'],
    },
    {
      text: 'Тестирование',
      icon: <AssignmentIcon />,
      path: '/dashboard/testing',
      roles: ['admin', 'manager', 'doctor', 'nurse', 'staff', 'teacher'],
    },
    {
      text: 'Управление тестами',
      icon: <AssignmentIcon />,
      path: '/dashboard/test-management',
      roles: ['admin', 'teacher'],
    },
    {
      text: 'Аналитика',
      icon: <InsightsIcon />,
      path: '/dashboard/analytics',
      roles: ['admin', 'manager'],
    },
  ];

  // Фильтрация элементов навигации по ролям пользователя
  const filteredNavigationItems = navigationItems.filter(
    (item) => currentUser && item.roles.includes(currentUser.role)
  );

  // Содержимое бокового меню
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <Typography variant="h6" noWrap component="div">
          Hospital System
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flex: 1, py: 0 }}>
        {filteredNavigationItems.map((item) => {
          const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  ...(isActive && {
                    bgcolor: 'action.selected',
                  }),
                  ...(drawerOpen ? {} : {
                    py: 1.5,
                    justifyContent: 'center',
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 3 : 0,
                    justifyContent: 'center',
                    color: isActive ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      color: isActive ? 'primary.main' : 'inherit',
                      fontWeight: isActive ? 'medium' : 'regular',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        {drawerOpen ? (
          <>
            <Avatar
              alt={currentUser?.name}
              src={currentUser?.avatarUrl}
              sx={{ width: 40, height: 40, mr: 2 }}
            >
              {currentUser?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" noWrap>
                {currentUser?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {currentUser?.role}
              </Typography>
            </Box>
          </>
        ) : (
          <Avatar
            alt={currentUser?.name}
            src={currentUser?.avatarUrl}
            sx={{ width: 40, height: 40, mx: 'auto' }}
          >
            {currentUser?.name?.[0]}
          </Avatar>
        )}
      </Box>
    </Box>
  );

  // Количество непрочитанных уведомлений
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Верхняя панель */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: {
            sm: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          },
          ml: {
            sm: drawerOpen ? `${drawerWidth}px` : 0,
          },
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Здесь может быть заголовок текущей страницы */}
          </Typography>

          {/* Иконка уведомлений */}
          <Tooltip title="Уведомления">
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={unreadNotificationsCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Меню пользователя */}
          <Box sx={{ ml: 2 }}>
            <Tooltip title="Профиль">
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ p: 0 }}
                aria-controls={userMenuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={userMenuOpen ? 'true' : undefined}
              >
                <Avatar
                  alt={currentUser?.name}
                  src={currentUser?.avatarUrl}
                  sx={{ width: 40, height: 40 }}
                >
                  {currentUser?.name?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Боковое меню для мобильных устройств */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Улучшает производительность на мобильных устройствах
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Боковое меню для десктопных устройств */}
        <Drawer
          variant="permanent"
          open={drawerOpen}
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerOpen ? drawerWidth : 64,
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Основное содержимое */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: {
            sm: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - 64px)`,
          },
          ml: {
            sm: drawerOpen ? `${drawerWidth}px` : 64,
          },
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar /> {/* Отступ для верхней панели */}
        <Outlet /> {/* Контент страницы */}
      </Box>

      {/* Меню пользователя */}
      <Menu
        id="user-menu"
        anchorEl={userMenuAnchorEl}
        open={userMenuOpen}
        onClose={handleUserMenuClose}
        MenuListProps={{
          'aria-labelledby': 'user-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Профиль</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Настройки</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Выйти</ListItemText>
        </MenuItem>
      </Menu>

      {/* Меню уведомлений */}
      <Menu
        id="notification-menu"
        anchorEl={notificationMenuAnchorEl}
        open={notificationMenuOpen}
        onClose={handleNotificationMenuClose}
        MenuListProps={{
          'aria-labelledby': 'notification-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            overflowY: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1">Уведомления</Typography>
        </Box>

        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id, notification.link)}
                sx={{
                  whiteSpace: 'normal',
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  py: 1.5,
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                  primaryTypographyProps={{
                    fontWeight: notification.read ? 'regular' : 'medium',
                  }}
                  secondaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                  }}
                />
              </MenuItem>
            ))}
            <Divider />
            <MenuItem
              onClick={() => navigate('/dashboard/notifications')}
              sx={{ justifyContent: 'center' }}
            >
              <Typography variant="body2" color="primary">
                Показать все уведомления
              </Typography>
            </MenuItem>
          </>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              У вас нет новых уведомлений
            </Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default DashboardLayout;