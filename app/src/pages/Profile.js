import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  styled,
  Typography,
  MenuItem,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuDrawer from '../components/MenuDrawer';
import { updateUser, getProfile, getRegions } from '../api/user';
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
      '& input': {
        color: 'white !important',
        '-webkit-text-fill-color': 'white !important',
      }
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
  '& .MuiOutlinedInput-input': {
    color: 'white',
  },
  '& .MuiOutlinedInput-input.Mui-disabled': {
    color: 'white',
    '-webkit-text-fill-color': 'white',
  }
});

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { userData, setUserData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const profileResponse = await getProfile();
      if (profileResponse.ok) {
        setUserData(profileResponse.user);
        setEditedData(profileResponse.user);
      }

      const regionsResponse = await getRegions();
      if (regionsResponse.ok) {
        setRegions(regionsResponse.regions);
      }
    };
    fetchData();
  }, []);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        // Подготавливаем данные для отправки
        const dataToUpdate = {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          region: userData.region,
          tg_id: userData.tg_id,
          role: userData.role
        };

        const response = await updateUser(dataToUpdate);
        if (response.ok) {
          // Обновляем данные пользователя полученными от сервера
          setUserData(response.user);
          console.log('Данные успешно обновлены:', response.user);
        } else {
          console.error('Ошибка при обновлении данных:', response.error);
        }
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
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
    return userData?.[field] || ''; // Возвращаем пустую строку вместо "отсутствует"
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
              #9c9c9c -10%,
              #a6768c 10%,
              rgba(26, 26, 26, 0.1) 50%
            ),
            radial-gradient(
              circle at top left,
              #9c9c9c -10%,
              #a6768c 10%,
              rgba(26, 26, 26, 0.1) 50%
            )
          `,
          zIndex: -1,
        }}
      >
      </Box>
      <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
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
              },
              gap: 2
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
              Профиль
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
              {userData?.role === 'ADMIN' ? 'администратор' 
              : userData?.role === 'REGIONAL_ADMIN' ? 'региональный представитель' 
              : userData?.role === 'CENTRAL_ADMIN' ? 'центральный представитель' 
              : 'пользователь'}
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
              transform: "translateX(-10%)",
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
              <TextField
                select
                fullWidth
                label="Регион"
                value={getFieldValue('region') || ''}
                onChange={handleChange('region')}
                disabled={!isEditing || userData.role == 'REGIONAL_ADMIN'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                    },
                    '&.Mui-disabled': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '& input': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '-webkit-text-fill-color': 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  '& .MuiSelect-icon': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '-webkit-text-fill-color': 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  width: '100%',
                  marginBottom: '15px',
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        bgcolor: '#1a1a1a',
                        '& .MuiMenuItem-root': {
                          color: '#fff',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {regions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </TextField>
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
                  onClick={() => navigate('/profile/events')}
                >
                  ваши подписки
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

