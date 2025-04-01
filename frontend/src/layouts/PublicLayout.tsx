import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Newspaper as NewspaperIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

import { RootState } from '../store';
import { authActions } from '../store/auth/authSlice';
import Footer from '../components/layout/Footer';

/**
 * Макет для публичных страниц сайта.
 */
const PublicLayout: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { isAuthenticated, currentUser } = useSelector((state: RootState) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  const userMenuOpen = Boolean(userMenuAnchorEl);

  // Обработчики событий
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    dispatch(authActions.logout());
    navigate('/');
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    if (currentUser) {
      navigate(`/dashboard/profile/${currentUser.id}`);
    }
  };

  const handleDashboardClick = () => {
    handleUserMenuClose();
    navigate('/dashboard');
  };

  // Навигационные элементы
  const navigationItems = [
    { text: 'Главная', path: '/', icon: <HomeIcon /> },
    { text: 'О нас', path: '/about', icon: <InfoIcon /> },
    { text: 'Новости', path: '/news', icon: <NewspaperIcon /> },
    { text: 'Контакты', path: '/contact', icon: <EmailIcon /> },
  ];

  // Отрисовка мобильного меню
  const mobileDrawer = (
    <Box onClick={handleDrawerToggle}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6">Меню</Typography>
        <IconButton edge="end" color="inherit" onClick={handleDrawerToggle} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <Box sx={{ mr: 2 }}>{item.icon}</Box>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={handleDashboardClick}>
                <Box sx={{ mr: 2 }}><DashboardIcon /></Box>
                <ListItemText primary="Дашборд" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleProfileClick}>
                <Box sx={{ mr: 2 }}><PersonIcon /></Box>
                <ListItemText primary="Профиль" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <Box sx={{ mr: 2 }}><LogoutIcon /></Box>
                <ListItemText primary="Выйти" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/auth/login">
              <Box sx={{ mr: 2 }}><LoginIcon /></Box>
              <ListItemText primary="Войти" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Верхняя панель */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
              }}
            >
              Hospital System
            </Typography>

            {/* Десктопное меню */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{
                    mx: 1,
                    ...(location.pathname === item.path && {
                      color: 'primary.main',
                      fontWeight: 'medium',
                    }),
                  }}
                >
                  {item.text}
                </Button>
              ))}

              {isAuthenticated ? (
                <Box sx={{ ml: 2 }}>
                  <Button
                    color="inherit"
                    onClick={handleUserMenuOpen}
                    endIcon={<ArrowDropDownIcon />}
                    startIcon={
                      <Avatar
                        alt={currentUser?.name}
                        src={currentUser?.avatarUrl}
                        sx={{ width: 24, height: 24 }}
                      >
                        {currentUser?.name?.[0]}
                      </Avatar>
                    }
                  >
                    {currentUser?.name || 'Пользователь'}
                  </Button>
                </Box>
              ) : (
                <Button
                  component={RouterLink}
                  to="/auth/login"
                  color="primary"
                  variant="contained"
                  startIcon={<LoginIcon />}
                  sx={{ ml: 2 }}
                >
                  Войти
                </Button>
              )}
            </Box>

            {/* Мобильное меню */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Мобильное боковое меню */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {mobileDrawer}
      </Drawer>

      {/* Основное содержимое */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Футер */}
      <Footer />

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
        <MenuItem onClick={handleDashboardClick}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Дашборд</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Профиль</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Выйти</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PublicLayout;