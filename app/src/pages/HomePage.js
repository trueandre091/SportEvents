import * as React from 'react';
import { Box, Typography } from '@mui/material';
import Header from '../components/Header';
import LoginRegistration from '../components/LoginRegistration';

const HomePage = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh', // Минимальная высота экрана
        overflowY: 'hidden',  // Разрешаем вертикальную прокрутку
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: { md: '0', sm: '-100%' },
          backgroundImage: 'linear-gradient(150deg, #ffffff 0%, #533ac2 20%, #1a1a1a 45%, #1a1a1a 50%, #a33e6d 80%, #d481a8 100%)',
          zIndex: -1,
          minWidth: '100vw', // Добавляем минимальную ширину
          minHeight: '100vh', // Добавляем минимальную высоту
          backgroundAttachment: 'fixed', // Фиксируем фон
          backgroundPosition: 'center', // Центрируем фон
          backgroundRepeat: 'no-repeat', // Запрещаем повторение
          backgroundSize: 'cover', // Растягиваем на весь экран
        }}
      />
      <Header /> {/* Шапка сайта */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center', // Центрирование элементов по горизонтали
          alignItems: 'center', // Выравнивание по вертикали
          flexDirection: 'row', // Горизонтальное расположение элементов по умолчанию
          flexWrap: 'wrap', // Размещение элементов в новый ряд при уменьшении экрана
          gap: 16, // Пробел между элементами
          padding: 2,
          marginTop: '100px',
          marginBottom: '100px',
          marginLeft: '200px',
          marginRight: '200px',
        }}
      >
        {/* Элемент 1 */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center',
            padding: 3,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { md: 'left', sm: 'center' }, color: 'white' }}>
            <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              transform: { md: 'translateX(-45px)', sm: 'translateX(0px)' },
              marginBottom: { md: '0px', sm: '30px' }
            }}>
              <Typography variant='h1'
                sx={{
                  fontFamily: 'The Nautigal',
                  fontSize: { md: '150px', sm: '0px' },
                  fontWeight: '500',
                  transform: { md: 'translateY(-20px) translateX(-10px)', sm: 'translateY(0px) translateX(0px)' },
                  color: 'white',
                }}>"</Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat',
                  fontSize: { md: '50px', sm: '40px' },
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}>
                Федерация спортивного программирования
              </Typography>
            </Box>


            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', color: 'white' }}>
              <Typography variant='h1'
                sx={{
                  fontFamily: 'Montserrat',
                  fontSize: '20px',
                  marginTop: '10px',
                  lineHeight: '1.7',
                }}>
                Это общественная спортивная организация, которая развивает и популяризирует спортивное программирование в России, проводит соревнования национального уровня. Мы также занимаемся формированием национальных сборных, обучением и аттестацией спортивных судей, аккредитацией площадок, подготовкой методических материалов, образовательными проектами, развитием клубов и секций.
              </Typography>
            </Box>
          </Box>

        </Box>

        {/* Элемент 2 */}
        <LoginRegistration />
      </Box>
    </Box>
  );
}

export default HomePage;
