import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuDrawer from '../components/MenuDrawer';

const AdminPanel = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const isCentralAdmin = () => {
    return ['ADMIN', 'CENTRAL_ADMIN'].includes(userData?.role);
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
      />

      <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />

      <Box sx={{
        width: '100hv',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5%',
        paddingRight: '20%',
        paddingLeft: '20%',
      }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignSelf: 'flex-end',
            justifyContent: 'end',
            gap: '13px',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Montserrat',
              color: '#fff',
              textAlign: 'center',
              mb: 4,
              alignSelf: 'flex-end',
              fontSize: '40px',
            }}
          >
            Здравствуйте,
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Unbounded',
              color: '#fff',
              textAlign: 'center',
              mb: 4,
              alignSelf: 'flex-end',
              fontSize: '40px',
            }}
          >
            {userData?.name || 'Администратор'}!
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: "1",
          height: '100%',
          width: '100%',
          gap: '50px',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '50px',
              width: '100%',
              height: '60%',
            }}
          >
            {isCentralAdmin() &&
              <Button
                variant="contained"
                onClick={() => navigate('/admin/regions')}
                disableElevation
                disableRipple
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '10px',
                  alignItems: 'start',
                  paddingLeft: '30px',
                  whiteSpace: 'normal',
                  textAlign: 'left',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '4px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0',
                  transition: 'background-color 0.3s ease', // Добавляем плавный переход
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Увеличиваем прозрачность при наведении
                    boxShadow: '0',
                  },
                  '&:active': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0',
                  }
                }}
              >
                <Typography variant="h4" sx={{ fontFamily: 'Unbounded', fontWeight: '1000', fontSize: '40px', color: '#fff', lineHeight: '1.4' }}>
                  Региональные
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: 'Montserrat', fontSize: '40px', color: '#fff', lineHeight: '1' }}>
                  представители<br />ФСП
                </Typography>
              </Button>
            }
            <Button
              variant="contained"
              onClick={() => navigate('/admin/events')}
              disableRipple
              disableElevation
              sx={{
                fontSize: '50px',
                fontFamily: 'Unbounded',
                width: '100%',
                height: '100%',
                borderRadius: '10px',
                justifyContent: 'flex-start',
                paddingLeft: '30px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '4px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0',
                transition: 'background-color 0.3s ease', // Добавляем плавный переход
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Увеличиваем прозрачность при наведении
                  boxShadow: '0',
                },
                '&:active': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  boxShadow: '0',
                }
              }}
            >
              События
            </Button>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '30%',
          }}>
            <Button
              variant="contained"
              onClick={() => navigate('/admin/stats')}
              disableRipple
              disableElevation
              sx={{
                width: '100%',
                height: '100%',
                fontSize: '50px',
                fontFamily: 'Unbounded',
                textAlign: 'left',
                paddingLeft: '30px',
                alignItems: 'center',
                justifyContent: isCentralAdmin() ? 'center' : 'flex-start',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '4px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0',
                transition: 'background-color 0.3s ease', // Добавляем плавный переход
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Увеличиваем прозрачность при наведении
                  boxShadow: '0',
                },
                '&:active': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  boxShadow: '0',
                }
              }}>
              Статистика
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPanel;