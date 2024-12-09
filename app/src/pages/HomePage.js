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
      }}
    >
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', color: 'white' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', transform: 'translateX(-45px)' }}>
              <Typography variant='h1'
                sx={{
                  fontFamily: 'The Nautigal',
                  fontSize: '150px',
                  fontWeight: '500',
                  transform: 'translateY(-20px) translateX(-10px)',
                  color: 'white',
                }}>"</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Montserrat', fontSize: '50px', fontWeight: 'bold', lineHeight: '1' }}>
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
