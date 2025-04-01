import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
  InputBase,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

import { useAuth } from '../contexts/AuthContext';
import { toggleDarkMode } from '../store/slices/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';

// Стилизованный компонент для поиска
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface HeaderProps {
  handleDrawerToggle: () => void;
}

/**
 * Компонент хедера приложения
 */
export const Header: React.FC<HeaderProps> = ({ handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  // Получаем darkMode из Redux
  const { darkMode } = useSelector((state: RootState) => state.ui);

  // Состояние для меню пользователя
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  // Состояние для меню уведомлений
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);

  // Обработчики открытия/закрытия меню пользователя
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Обработчики открытия/закрытия меню уведомлений
  const handleOpenNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotificationMenu = () => {
    setAnchorElNotifications(null);
  };

  // Обработчик переключения темы
  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  // Обработчик выхода из системы
  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/login');
  };

  // Обработчик перехода к профилю
  const handleGoToProfile = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  // Обработчик перехода к настройкам
  const handleGoToSettings = () => {
    handleCloseUserMenu();
    navigate('/settings');
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Кнопка меню (сайдбара) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Заголовок */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          МедСистема
        </Typography>

        {/* Поиск */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Поиск..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Переключатель темы */}
          <Tooltip title={darkMode ? 'Светлая тема' : 'Темная тема'}>
            <IconButton color="inherit" onClick={handleToggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Уведомления */}
          <Tooltip title="Уведомления">
            <IconButton
              color="inherit"
              onClick={handleOpenNotificationMenu}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            sx={{ mt: '45px' }}
            id="notifications-menu"
            anchorEl={anchorElNotifications}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotificationMenu}
          >
            <Typography sx={{ p: 2 }} variant="subtitle1">
              Уведомления
            </Typography>
            <Divider />
            <MenuItem onClick={handleCloseNotificationMenu}>
              <Typography variant="body2">У вас новое сообщение</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseNotificationMenu}>
              <Typography variant="body2">Тест "Первая помощь" обновлен</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseNotificationMenu}>
              <Typography variant="body2">Документ ожидает верификации</Typography>
            </MenuItem>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <Button size="small" color="primary">
                Все уведомления
              </Button>
            </Box>
          </Menu>

          {/* Меню пользователя */}
          <Box sx={{ ml: 2 }}>
            <Tooltip title="Открыть меню">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {user?.avatar ? (
                  <Avatar alt={user.full_name} src={user.avatar} />
                ) : (
                  <Avatar>{user?.first_name?.[0] || <AccountCircle />}</Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {user && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1">{user.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              )}
              <Divider />

              <MenuItem onClick={handleGoToProfile}>
                <PersonIcon fontSize="small" sx={{ mr: 2 }} />
                <Typography variant="body2">Мой профиль</Typography>
              </MenuItem>

              <MenuItem onClick={handleGoToSettings}>
                <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
                <Typography variant="body2">Настройки</Typography>
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
                <Typography variant="body2">Выход</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};