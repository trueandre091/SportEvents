import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
} from '@mui/material';
import { updateUser, createUser, getRegions } from '../api/user';

const ROLES = ['ADMIN', 'CENTRAL_ADMIN', 'REGIONAL_ADMIN', 'USER'];

// Иерархия ролей (чем меньше число, тем выше роль)
const ROLE_HIERARCHY = {
  'ADMIN': 0,
  'CENTRAL_ADMIN': 1,
  'REGIONAL_ADMIN': 2,
  'USER': 3
};

const UserModal = ({ open, handleClose, user, onUserUpdated, currentUserRole, isCreating = false }) => {
  const [editedUser, setEditedUser] = useState({
    name: '',
    username: '',
    email: '',
    tg_id: '',
    role: '',
    region: ''
  });
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !isCreating) {
      setEditedUser({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        tg_id: user.tg_id || '',
        role: user.role || '',
        region: user.region || ''
      });
    } else if (isCreating) {
      setEditedUser({
        name: '',
        username: '',
        email: '',
        tg_id: '',
        role: '',
        region: ''
      });
    }

    const loadRegions = async () => {
      const response = await getRegions();
      if (response.ok) {
        setRegions(response.regions);
      }
    };
    loadRegions();
  }, [user, isCreating, open]);

  // Проверка возможности установки роли
  const canSetRole = (roleToSet) => {
    // ADMIN может всё
    if (currentUserRole === 'ADMIN') return true;

    const currentUserLevel = ROLE_HIERARCHY[currentUserRole];
    const roleToSetLevel = ROLE_HIERARCHY[roleToSet];
    const userRoleLevel = user ? ROLE_HIERARCHY[user.role] : Infinity;

    // CENTRAL_ADMIN не может установить роль выше или равную своей
    if (currentUserRole === 'CENTRAL_ADMIN') {
      return roleToSetLevel > currentUserLevel;
    }

    // REGIONAL_ADMIN может установить только роль USER
    if (currentUserRole === 'REGIONAL_ADMIN') {
      return roleToSet === 'USER';
    }

    return false;
  };

  // Получение доступных для выбора ролей
  const getAvailableRoles = () => {
    if (currentUserRole === 'ADMIN') return ROLES;
    
    return ROLES.filter(role => {
      const roleLevel = ROLE_HIERARCHY[role];
      const currentUserLevel = ROLE_HIERARCHY[currentUserRole];
      
      // CENTRAL_ADMIN может назначать роли ниже своей
      if (currentUserRole === 'CENTRAL_ADMIN') {
        return roleLevel > currentUserLevel;
      }
      
      // REGIONAL_ADMIN может назначать только USER
      if (currentUserRole === 'REGIONAL_ADMIN') {
        return role === 'USER';
      }
      
      return false;
    });
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    
    // Проверка при изменении роли
    if (field === 'role' && !canSetRole(value)) {
      setError('У вас нет прав для установки этой роли');
      return;
    }

    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!editedUser.email) {
      setError('Email обязателен');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      setError('Неверный формат email');
      return false;
    }
    if (!editedUser.region) {
      setError('Регион обязателен');
      return false;
    }
    if (!editedUser.role) {
      setError('Роль обязательна');
      return false;
    }
    // Проверка прав на установку роли
    if (!canSetRole(editedUser.role)) {
      setError('У вас нет прав для установки этой роли');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let response;
      if (isCreating) {
        response = await createUser(editedUser);
      } else {
        response = await updateUser({
          ...editedUser,
          id: user?.id
        });
      }

      if (response.ok) {
        onUserUpdated(response.user);
        handleClose();
        setEditedUser({
          name: '',
          username: '',
          email: '',
          tg_id: '',
          role: '',
          region: ''
        });
        setError('');
      } else {
        setError(response.error || 'Ошибка при обновлении пользователя');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setEditedUser({
      name: '',
      username: '',
      email: '',
      tg_id: '',
      role: '',
      region: ''
    });
    setError('');
    handleClose();
    window.location.reload();
  };

  return (
    <Dialog 
      open={open} 
      onClose={resetForm}
      PaperProps={{
        sx: {
          bgcolor: '#1a1a1a',
          color: '#fff',
          minWidth: '500px'
        }
      }}
    >
      <DialogTitle sx={{ fontFamily: 'Montserrat' }}>
        {isCreating ? 'Создание пользователя' : 'Редактирование пользователя'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          mt: 2
        }}>
          {error && (
            <Box sx={{ color: 'error.main', mb: 2 }}>
              {error}
            </Box>
          )}
          <TextField
            label="Имя"
            value={editedUser.name}
            onChange={handleChange('name')}
            fullWidth
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
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
              },
            }}
          />
          <TextField
            label="Имя пользователя"
            value={editedUser.username}
            onChange={handleChange('username')}
            fullWidth
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
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
              },
            }}
          />
          <TextField
            label="Email"
            value={editedUser.email}
            onChange={handleChange('email')}
            required
            fullWidth
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
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
              },
            }}
          />
          <TextField
            label="Telegram ID"
            value={editedUser.tg_id}
            onChange={handleChange('tg_id')}
            type="number"
            inputProps={{ 
              min: "0",
              step: "1",
              pattern: "[0-9]*"
            }}
            fullWidth
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
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  '-webkit-appearance': 'none',
                  margin: 0
                },
                '&[type=number]': {
                  '-moz-appearance': 'textfield'
                }
              },
            }}
          />
          <TextField
            select
            label="Роль"
            value={editedUser.role}
            onChange={handleChange('role')}
            required
            fullWidth
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
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '& input': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    '-webkit-text-fill-color': 'rgba(255, 255, 255, 0.5)',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiSelect-icon': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
              },
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
            {getAvailableRoles().map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Регион"
            value={editedUser.region}
            onChange={handleChange('region')}
            required
            fullWidth
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
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiSelect-icon': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
              },
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={resetForm}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#402fff',
            '&:hover': {
              bgcolor: '#3023bb',
            },
          }}
        >
          {isCreating ? 'Создать' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal; 