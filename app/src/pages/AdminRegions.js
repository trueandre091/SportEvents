import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import MenuDrawer from '../components/MenuDrawer';
import { getUsers } from '../api/user';
import SearchIcon from '@mui/icons-material/Search';

const AdminRegions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const roles = ["REGIONAL_ADMIN", "CENTRAL_ADMIN"];

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user => 
    user.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Получаем оба списка параллельно
        const [regionalResponse, centralResponse] = await Promise.all([
          getUsers(roles[0]),
          getUsers(roles[1])
        ]);

        // Объединяем списки, если оба запроса успешны
        if (regionalResponse.ok && centralResponse.ok) {
          const allUsers = [
            ...regionalResponse.users,
            ...centralResponse.users
          ];
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    };
    loadUsers();
  }, []);

  return (
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
      backgroundSize: 'cover',
      overflowY: 'auto',  // Разрешаем вертикальную прокрутку
      overflowX: 'hidden', // Запрещаем горизонтальную прокрутку
    }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(
              circle at bottom center,
              #ffffff -10%,
              #533ac2 10%,
              rgba(83, 58, 194, 0.8) 20%,
              rgba(26, 26, 26, 0.9) 45%,
              rgba(26, 26, 26, 1) 60%
            )
          `,
          zIndex: -1,
        }}
      >
      </Box>
      <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
      <Box
        sx={{
          maxWidth: { md: "80%", sm: "none" },
          margin: { md: "auto", sm: "20px" },
          marginTop: { md: "100px", sm: "10%" },
          padding: { md: "20px", sm: "10px" },
          border: "2px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "40px",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between', // Разделяет элементы на противоположные стороны
            transform: 'translateX(15px)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography
              variant='h1'
              sx={{
                fontFamily: 'The Nautigal',
                fontSize: '150px',
                fontWeight: '500',
                transform: 'translateX(-10px)',
                color: 'white',
              }}
            >
              "
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '40px',
                fontWeight: 'bold',
                lineHeight: '1',
              }}
            >
              Региональные предствители ФСП
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          padding: { sm: "10px", md: "10px" },
          paddingBottom: "20px",
          marginLeft: { md: "50px", sm: "0px" },
          marginRight: { md: "50px", sm: "0px" },
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск по региону или руководителю..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '30px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#fff',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: '#fff',
                padding: '15px 20px',
                fontSize: '16px',
                fontFamily: 'Montserrat',
              },
              '& .MuiInputAdornment-root': {
                color: '#fff',
              },
              transform: 'translateX(-10px)',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: { sm: "10px", md: "40px" },
            marginBottom: { md: "20px", sm: "10px" },
            marginLeft: { md: "50px", sm: "0px" },
            marginRight: { md: "50px", sm: "0px" },
            borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <Typography
            sx={{
              flex: 1,
              fontSize: { sm: '14px', md: '20px' },
              fontFamily: 'Montserrat',
            }}
          >
            Субъект РФ
          </Typography>
          <Typography
            sx={{
              flex: 1,
              fontSize: { sm: '14px', md: '20px' },
              fontFamily: 'Montserrat',
            }}
          >
            Руководитель
          </Typography>
          <Typography
            sx={{
              flex: 1,
              fontSize: { sm: '14px', md: '20px' },
              fontFamily: 'Montserrat',
            }}
          >
            Контакты
          </Typography>
        </Box>
        {filteredUsers.map((user, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "row", // Изменили на row для горизонтального расположения
              justifyContent: "space-between",
              padding: { sm: "10px", md: "40px" },
              marginBottom: { md: "20px", sm: "10px" },
              marginLeft: { md: "50px", sm: "0px" },
              marginRight: { md: "50px", sm: "0px" },
              borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              position: "relative",
              '&:hover': {
                transition: 'background 0.3s ease'
              }
            }}
          >
            <Typography
              sx={{
                flex: 1,
                fontSize: { sm: '14px', md: '16px' },
                fontFamily: 'Montserrat',
              }}
            >
              {user.region}
            </Typography>
            <Typography
              sx={{
                flex: 1,
                fontSize: { sm: '14px', md: '16px' },
                fontFamily: 'Montserrat',
              }}
            >
              {user.name}
            </Typography>
            <Typography
              sx={{
                flex: 1,
                fontSize: { sm: '14px', md: '16px' },
                fontFamily: 'Montserrat',
                '& a': {
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }
              }}
            >
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AdminRegions;