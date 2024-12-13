import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment, Button, IconButton } from '@mui/material';
import MenuDrawer from '../components/MenuDrawer';
import { getUsers, deleteUser } from '../api/user';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import UserModal from '../components/UserModal';
import { useAuth } from '../context/AuthContext';

const AdminRegions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const navigate = useNavigate();
  const { userData } = useAuth();

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Группировка пользователей по региону
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const region = user.region || 'Без региона';
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(user);
    return acc;
  }, {});

  useEffect(() => {
    const loadUsers = async () => {
      // Если текущий пользователь ADMIN, получаем оба типа пользователей
      if (userData?.role === 'ADMIN') {
        const [regionalResponse, centralResponse] = await Promise.all([
          getUsers('REGIONAL_ADMIN'),
          getUsers('CENTRAL_ADMIN')
        ]);

        if (regionalResponse.ok && centralResponse.ok) {
          // Объединяем списки пользователей
          setUsers([...regionalResponse.users, ...centralResponse.users]);
        }
      } else {
        // Для остальных ролей получаем только региональных администраторов
        const response = await getUsers('REGIONAL_ADMIN');
        if (response.ok) {
          setUsers(response.users);
        }
      }
    };
    loadUsers();
  }, [userData?.role]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (userId) => {
    try {
      const response = await deleteUser(userId);
      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setIsCreating(false);
  };

  const handleUserUpdated = (updatedUser) => {
    if (isCreating) {
      setUsers(prev => [...prev, updatedUser]);
    } else {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
      backgroundSize: 'cover',
      overflowY: 'auto',
      overflowX: 'hidden',
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
      />
      <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
      <IconButton
        onClick={() => navigate('/admin')}
        sx={{
          position: "fixed",
          top: "10px",
          left: "180px",
          color: "white",
          flexDirection: "row"
        }}
      >
        <ArrowBackIcon />
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Montserrat",
            fontSize: "25px",
            transform: "translateX(10px)",
            cursor: "pointer",
          }}
        >
          Назад в admin панель
        </Typography>
      </IconButton>
      <Box
        sx={{
          maxWidth: { md: "85%", sm: "none" },
          margin: { md: "auto", sm: "20px" },
          marginTop: { md: "50px", sm: "5%" },
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
            transform: { md: 'translateX(15px)', sm: 'translateX(40px)' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              transform: 'translateX(-100px)',
              width: '100%'
            }}
          >
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
                color: 'white',
              }}
            >
              Региональные предствители ФСП
            </Typography>
          </Box>
        </Box>
        <Box sx={{
          padding: { sm: "10px", md: "10px" },
          paddingBottom: "20px",
          width: "100%",
        }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Поиск представителей..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 1,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                setSelectedUser(null);
                setIsCreating(true);
                setIsModalOpen(true);
              }}
              sx={{
                backgroundColor: '#2196f3',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1976d2',
                },
                whiteSpace: 'nowrap',
              }}
            >
              Добавить представителя
            </Button>
          </Box>
          {Object.entries(groupedUsers).map(([region, users]) => (
            <Box
              key={region}
              sx={{
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#fff',
                  marginBottom: '15px',
                  fontFamily: 'Montserrat',
                  fontSize: '24px'
                }}
              >
                {region}
              </Typography>
              {users.map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '5px',
                    marginBottom: '10px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#fff',
                        fontFamily: 'Montserrat',
                        fontSize: '16px'
                      }}
                    >
                      {user.name || "представитель отсутствует"}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: 'Montserrat',
                        fontSize: '14px'
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleEditClick(user)}
                      sx={{
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(user.id)}
                      sx={{
                        color: '#ff4444',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      <UserModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
        currentUserRole={userData?.role}
        isCreating={isCreating}
      />
    </Box>
  );
};

export default AdminRegions;