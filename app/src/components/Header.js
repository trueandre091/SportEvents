/**
 * Компонент Header - шапка сайта с навигацией и меню пользователя
 * 
 * Функциональность:
 * - Адаптивное меню (мобильное/десктопное)
 * - Навигация по основным разделам
 * - Меню пользователя с профилем и выходом
 * - Обработка авторизации
 */

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { getTokenFromStorage, removeToken } from '../utils/tokenUtils';
import { useAuth } from '../context/AuthContext';

// Конфигурация пунктов меню
const pages = [
  { title: 'Все мероприятия', path: '/events' },
  { title: 'О нас', path: '/about' },
  { title: 'Контакты', path: '/contacts' }
];
const settings = ["Профиль", "Выйти"];

function Header() {
  // Состояния для управления меню
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Обработчики открытия/закрытия меню
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  // Обработчик клика по логотипу
  const handleLogoClick = () => {
    navigate('/');
  };

  // Закрытие навигационного меню
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // Закрытие меню пользователя
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Обработка действий в меню пользователя
  const handleButtonClick = (setting) => {
    if (setting === "Профиль") {
      const token = getTokenFromStorage();
      if (token) {
        navigate('/profile');
      } else {
        removeToken();
        logout();
        navigate('/');
      }
    }
    if (setting === "Выйти") {
      removeToken();
      logout();
      navigate('/');
    }
  };

  return (
    <AppBar position="static"
      sx={{
        borderRadius: "20px",
        backgroundColor: "white",
        color: "black",
        margin: "0 auto",
        width: "80%",
        transform: "translateY(10px)",
      }}
    >
      <Container maxWidth="xl">

        <Toolbar disableGutters>
          {/* Логотип для десктопа */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
            <IconButton
              onClick={handleLogoClick}
              sx={{
                height: "auto",
                borderRadius: '5px',
                padding: 0,
              }}
            >
              <img
                src="/images/logo.svg"
                alt="Logo"
                style={{ width: 300, height: 'auto' }}
              />
            </IconButton>
          </Box>

          {/* Мобильное меню */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="black"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {/* Пункты мобильного меню */}
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={() => {
                  handleCloseNavMenu();
                  navigate(page.path);
                }}>
                  <Typography sx={{ textAlign: 'center' }}>{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Логотип для мобильных устройств */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton>
              <img
                src="/images/logo.svg"
                alt="Logo"
                style={{ width: 300, height: 'auto' }}
              />
            </IconButton>
          </Box>

          {/* Заголовок для мобильных устройств */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'Montserrat',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
          </Typography>

          {/* Десктопное меню */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => {
                  handleCloseNavMenu();
                  navigate(page.path);
                }}
                sx={{ my: 2, color: 'black', display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Меню пользователя */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <img
                  src="/images/avatar.png"
                  alt="Logo"
                  style={{ width: 50, height: 'auto' }}
                />
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
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => {
                  handleCloseUserMenu();
                  handleButtonClick(setting);
                }}>
                  <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;