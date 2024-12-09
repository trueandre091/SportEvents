import * as React from 'react';
import './styles/LoginRegistration.css';
import useLoginRegistration from './states/useLoginRegistration';
import { Box, Typography, TextField, Button } from '@mui/material';

const animationAppear = {
  animation: `fadeIn 0.5s ease-in-out`,
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
};

const LoginRegistration = () => {
  const {
    isRegistering,
    email,
    password,
    confirmPassword,
    verificationCode,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleVerificationCodeChange,
    handleSubmit,
    toggleForm,
    error,
    shakeError
  } = useLoginRegistration();

  return (
    <Box
      sx={{
        ...animationAppear,
        flex: 0.4,
        display: 'flex',
        flexDirection: 'column', // Для вертикального размещения элементов
        justifyContent: 'space-between',
        padding: 3,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        boxShadow: 5,
        height: "600px",
        minWidth: '450px', // Минимальная ширина блока
        maxWidth: '600px',
        transition: "all 0.5s ease-in-out", // Плавный переход для стиля
      }}
    >
      <Button
        sx={{
          marginBottom: '20px', color: 'black', fontFamily: 'Montserrat', fontSize: '16px',
          alignSelf: 'flex-end',
          '&:hover': {
            transform: 'scale(1.1)', // Increase size on hover
            transition: 'transform 0.2s ease-in-out', // Smooth transition
            backgroundColor: 'transparent', // Keep background transparent if desired
          },
        }}
        variant="text"
        onClick={toggleForm}
        disableRipple={true}
      >
        {isRegistering ? 'Войти' : 'Зарегистрироваться'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat',
            fontSize: '40px',
            marginTop: isRegistering ? "40px" : "160px",
            transition: "all 0.5s ease-in-out",
            animation: isRegistering ? "form-enter 0.5s ease-in-out" : "form-exit 0.5s ease-in-out"
          }}>
          {isRegistering ? 'Регистрация' : 'Войти'}
        </Typography>
        {!isRegistering && (
          <Button
            sx={{
              marginBottom: '4px', color: 'black', fontFamily: 'Montserrat', fontSize: '12px',
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s ease-in-out', // Smooth transition
                backgroundColor: 'transparent', // Keep background transparent if desired
              },
            }}
            variant="text"
            onClick={toggleForm}
            disableRipple={true}
          >
            забыли пароль?
          </Button>
        )}
      </Box>

      <Box
        component="form"
        sx={{
          '& > :not(style)': {
            m: 1,
            width: '96%',
            marginBottom: '20px',
            borderRadius: '30px',
            backgroundImage: 'linear-gradient(to right, #6346e8, #3b298a)',
            '& .MuiFilledInput-root': {
              backgroundImage: 'linear-gradient(to right, #6346e8, #3b298a)',  // Синий фон для поля
              borderRadius: '30px',
              '& fieldset': {
                border: 'none',
              },
              '& input': {
                color: 'white',
                fontFamily: 'Montserrat',
                height: '50px',
                transform: 'translateX(10px)',
              },
              '&.Mui-focused': {
                border: 'none', // Убираем границу при фокусе
                boxShadow: 'none', // Убираем тень фокуса
              },
            },
            '& .MuiInputLabel-root': {
              color: 'white',
              fontFamily: 'Montserrat',
              transform: 'translateX(30px) translateY(10px)', // Shift the label to the left
              fontSize: '16px',
            },
          },
          marginTop: '30px',
        }}
        noValidate
        autoComplete="false"
      >

        <TextField
          id="filled-basic"
          label="Email"
          variant="filled"
          value={email}
          InputProps={{
            disableUnderline: true,
          }}
          onChange={handleEmailChange}
          className={shakeError ? 'errorShake' : ''}
        />
        <TextField
          id="filled-basic"
          label="Пароль"
          variant="filled"
          value={password}
          InputProps={{
            disableUnderline: true,
          }}
          onChange={handlePasswordChange}
          className={shakeError ? 'errorShake' : ''}
        />
        {isRegistering && (
          <TextField
            label="Подтвердить пароль"
            variant="filled"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            InputProps={{
              disableUnderline: true,
            }}
            className={shakeError ? 'errorShake' : ''}
          />
        )}
      </Box>
      {isRegistering && (
        <Button
          sx={{
            marginBottom: '20px', color: 'black', fontFamily: 'Montserrat', fontSize: '16px',
            '&:hover': {
              transform: 'scale(1.1)', // Increase size on hover
              transition: 'transform 0.2s ease-in-out', // Smooth transition
              backgroundColor: 'transparent', // Keep background transparent if desired
            },
          }}
          variant="text"
          onClick={handleSubmit}
          disableRipple={true}
        >
          Получить код
        </Button>
      )}

    </Box>
  );
};

export default LoginRegistration;
