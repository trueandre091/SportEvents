import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  TextField,
  styled,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Стилизованное текстовое поле
const StyledTextField = styled(TextField)({
  marginBottom: '16px',
  '& .MuiOutlinedInput-root': {
    color: 'white',
    fontFamily: 'Montserrat',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '30px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-disabled': {
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'white',
    fontFamily: 'Montserrat',
  },
  '& .MuiInputLabel-root.Mui-disabled': {
    color: 'white',
    fontFamily: 'Montserrat',
  },
});

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { userData, setUserData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      console.log('Saving data:', userData);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field) => (event) => {
    setUserData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Функция для безопасного получения значения поля
  const getFieldValue = (field) => {
    return userData?.[field] || 'отсутствует'; // Возвращаем "отсутствует" если поле null или undefined
  };

  // Функция проверки роли администратора
  const isAdminRole = () => {
    const adminRoles = ['ADMIN', 'REGIONAL_ADMIN', 'CENTRAL_ADMIN'];
    return adminRoles.includes(userData?.role);
  };

  return (
    <Box sx={{
      position: 'relatve',
      minHeight: '100vh',
      backgroundSize: 'cover',
      overflowY: 'auto',  // Разрешаем вертикальную прокрутку
      overflowX: 'hidden', // Запрещаем горизонтальную прокрутку
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(
              circle at bottom right,
              #ffffff -10%,
              #a33e6d 10%,
              rgba(26, 26, 26, 0.1) 50%
            ),
            radial-gradient(
              circle at top left,
              #ffffff -10%,
              #a33e6d 10%,
              rgba(26, 26, 26, 0.1) 50%
            )
          `,
          zIndex: -1,
        }}
      >
      </Box>
      <IconButton onClick={toggleDrawer} sx={{ position: "absolute", top: "10px", left: "40px", color: "white", flexDirection: "row" }}>
        <MenuIcon />
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Montserrat",
            fontSize: "25px",
            transform: "translateX(10px)",
            cursor: "pointer",
          }}
        >
          Меню
        </Typography>
      </IconButton>
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { md: "20%", sm: "60%" }, // Для мобильных устройств уже
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Box onClick={toggleDrawer} sx={{ display: "flex", flexDirection: "row", alignItems: "center", cursor: "pointer" }}>
            <MenuIcon sx={{ fontSize: "30px", marginLeft: "25px", marginTop: "15%" }} />
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Montserrat",
                fontSize: "25px",
                marginLeft: "10px",
                marginTop: "15%",
                cursor: "pointer",
              }}
            >
              Меню
            </Typography>
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "10%",
              top: "10%",
              height: "80%",
              width: "3px",
              background: "#000", // Цвет полоски
            }}
          />
        </Box>
        <List sx={{ marginLeft: "50px", marginTop: "10%" }}>
          {[
            { text: "профиль", link: "/profile" },
            { text: "регионы", link: "/regions" },
            { text: "контакты", link: "/contacts" },
            { text: "о нас", link: "/about" },
            { text: "на главную", link: "/" }
          ].map(({ text, link }) => (
            <Link to={link} style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button key={text}>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    fontFamily: "Montserrat", // Задаём шрифт
                    fontSize: "30px",         // Задаём размер текста
                  }} />
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
      <Box
        sx={{
          minWidth: { md: "80%", sm: "none" },
          maxWidth: { md: "80%", sm: "none" },
          margin: { md: "auto", sm: "20px" },
          marginTop: { md: "100px", sm: "10%" },
          border: "2px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "40px",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            width: '100%',
            padding: '20px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: "#402fff",
            padding: "30px 40px",
            borderTopLeftRadius: "40px",  // Закругляем только верхние углы
            borderTopRightRadius: "40px",
            overflow: "visible",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: '80%',
              position: 'relative', // Добавляем для контроля пространства
              '&::after': { // Добавляем пространство справа
                content: '""',
                width: { md: '300px', sm: '200px', xs: '150px' },
                display: 'block'
              }
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Montserrat',
                fontSize: { md: '30px', sm: '24px' },
                fontWeight: 500,
                color: '#fff',
                position: 'relative',
              }}
            >
              Личный кабинет
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: { md: '18px', sm: '14px' },
                color: 'rgba(255, 255, 255, 0.7)',
                position: 'relative',
                alignSelf: 'flex-end',
              }}
            >
              {userData?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
            </Typography>
          </Box>
          <Avatar
            sx={{
              position: 'absolute',
              bgcolor: 'rgba(26, 26, 26, 1)',
              border: { md: '20px solid white', sm: '10px solid white' }, // Адаптивная рамка
              width: { md: "300px", sm: "200px", xs: "150px" }, // Адаптивная ширина
              height: { md: "300px", sm: "200px", xs: "150px" }, // Адаптивная высота
              right: { md: "200px", sm: "100px", xs: "50px" }, // Адаптивное позиционирование
              top: { md: "10px", sm: "5px", xs: "5px" },
              transform: "translateX(10%)",
              '& .MuiSvgIcon-root': { // Адаптивный размер иконки
                fontSize: { md: 100, sm: 70, xs: 50 }
              },
              zIndex: 1,
            }}
          >
            <PersonIcon />
          </Avatar>
        </Box>
        <Box sx={{
          p: 4,
          position: 'relative',
          padding: { md: "20px", sm: "10px" }, // Добавляем padding для контента
        }}>
          <Box sx={{ p: 4, position: 'relative' }}>
            {/* Форма */}
            <Box component="form" sx={{ maxWidth: "80%" }}>
              <StyledTextField
                fullWidth
                label="ФИО"
                value={getFieldValue('name')}
                onChange={handleChange('name')}
                disabled={!isEditing}
                InputProps={{ readOnly: !isEditing }}
              />
              <StyledTextField
                fullWidth
                label="Регион"
                value={getFieldValue('region')}
                onChange={handleChange('region')}
                disabled={!isEditing}
                InputProps={{ readOnly: !isEditing }}
              />
              <StyledTextField
                fullWidth
                label="Email"
                value={getFieldValue('email')}
                onChange={handleChange('email')}
                disabled={true}
                InputProps={{ readOnly: true }}
              />
              <StyledTextField
                fullWidth
                label="Telegram ID"
                value={getFieldValue('tg_id')}
                onChange={handleChange('tg_id')}
                disabled={!isEditing}
                InputProps={{ readOnly: !isEditing }}
              />
              <StyledTextField
                fullWidth
                label="Имя пользователя"
                value={getFieldValue('username')}
                onChange={handleChange('username')}
                disabled={!isEditing}
                InputProps={{ readOnly: !isEditing }}
              />

              {/* Кнопки */}
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mt: 4,
                justifyContent: 'center'
              }}>
                {/* Если пользователь админ, показываем кнопку админ-панели */}
                {isAdminRole() && (
                  <Button
                    sx={{
                      borderRadius: '30px',
                      padding: '15px 30px', // Увеличенный padding
                      textTransform: 'none',
                      fontSize: '20px', // Увеличенный размер шрифта
                      fontFamily: 'Montserrat',
                      color: 'white',
                      backgroundColor: '#5500ff', // Другой цвет для выделения
                      '&:hover': {
                        backgroundColor: '#6a00ff',
                      },
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                      marginBottom: 2, // Отступ от других кнопок
                    }}
                    fullWidth
                    onClick={() => navigate('/admin')}
                  >
                    Admin Панель
                  </Button>
                )}

                <Button
                  sx={{
                    borderRadius: '30px',
                    padding: '10px 20px',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontFamily: 'Montserrat',
                    color: 'white',
                    backgroundColor: '#ff1f75',
                    '&:hover': {
                      backgroundColor: '#7722ff',
                    },
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                  }}
                  fullWidth
                  onClick={() => navigate('/events')}
                >
                  ваши мероприятия
                </Button>
                <Button
                  sx={{
                    borderRadius: '30px',
                    padding: '10px 20px',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontFamily: 'Montserrat',
                    color: 'white',
                    backgroundColor: '#ff1f75',
                    '&:hover': {
                      backgroundColor: '#7722ff',
                    },
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                  }}
                  fullWidth
                  onClick={handleEditToggle}
                >
                  {isEditing ? 'сохранить' : 'изменить данные'}
                </Button>
                <Button
                  sx={{
                    borderRadius: '30px',
                    padding: '10px 20px',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontFamily: 'Montserrat',
                    color: 'white',
                    backgroundColor: '#ff1f75',
                    '&:hover': {
                      backgroundColor: '#7722ff',
                    },
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                  }}
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  на главную
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;

