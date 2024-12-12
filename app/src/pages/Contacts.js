import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MenuDrawer from '../components/MenuDrawer';

const Contacts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

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
              Контакты
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '50px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              variant='h6'
              sx={{
                color: 'white',
                '& a': {  // Добавляем стили для всех ссылок внутри Typography
                  color: 'white',  // Цвет ссылки
                  textDecoration: 'none',  // Убираем подчеркивание
                  '&:hover': {
                    textDecoration: 'underline',  // Подчеркивание при наведении
                    opacity: 0.8  // Немного уменьшаем непрозрачность при наведении
                  }
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant='h6' sx={{ fontFamily: 'Montserrat', fontSize: '25px', fontWeight: 'bold', lineHeight: '2' }}>Электронная почта: <a href='mailto:info@fsp-russia.com'>info@fsp-russia.com</a></Typography><br />
              <Typography variant='h6' sx={{ fontFamily: 'Montserrat', fontSize: '25px', fontWeight: 'bold', lineHeight: '2' }}>Телефон: +7 (499) 678-03-05</Typography><br />
              <Typography variant='h6' sx={{ fontFamily: 'Montserrat', fontSize: '25px', fontWeight: 'bold', lineHeight: '2' }}>Адрес: 125047, г. Москва, 2-я Брестская, д. 8, этаж 9</Typography><br />
              <Typography variant='h6' sx={{ fontFamily: 'Montserrat', fontSize: '25px', fontWeight: 'bold', lineHeight: '2' }}>Пресс-служба: <a href='mailto:press@fsp-russia.com'>press@fsp-russia.com</a></Typography><br />
              <Typography variant='h6' sx={{ fontFamily: 'Montserrat', fontSize: '25px', fontWeight: 'bold', lineHeight: '2' }}>ВКонтакте: <a href='https://vk.com/russiafsp'>vk.com/russiafsp</a></Typography><br />
              <Typography variant='h6' sx={{ fontFamily: 'Montserrat', fontSize: '25px', fontWeight: 'bold', lineHeight: '2' }}>Telegram: <a href='https://t.me/fsprussia'>t.me/fsprussia</a></Typography><br />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '30px',
              borderRadius: '20px',
              background: '#402fff',
              padding: '10px',
            }}>
            <img src={require('../components/assets/contacts1.png')} alt="Контакты 1 фото" />
            <img src={require('../components/assets/contacts2.png')} alt="Контакты 2 фото" />
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default Contacts;