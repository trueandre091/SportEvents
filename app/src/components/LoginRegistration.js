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
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    toggleForm,
    error,
    shakeError,
    isCodeRequested,
    verificationCode,
    handleVerificationCodeChange,
    handleVerificationCodeSubmit,
    isRegistered,
    isLoading
  } = useLoginRegistration();

  return (
    <Box
      className={isLoading ? 'loading' : ''}
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
          marginBottom: '20px',
          color: 'black',
          fontFamily: 'Montserrat',
          fontSize: '16px',
          alignSelf: 'flex-end',
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out',
            backgroundColor: 'transparent',
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
            marginTop: isRegistering ? "-20px" : "160px",
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
              backgroundImage: 'linear-gradient(to right, #6346e8, #3b298a)',
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
                border: 'none',
                boxShadow: 'none',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'white',
              fontFamily: 'Montserrat',
              transform: 'translateX(30px) translateY(10px)',
              fontSize: '16px',
            },
          },
          marginTop: '30px',
        }}
        noValidate
        autoComplete="on"
      >

        <TextField
          id="email"
          label="Email"
          variant="filled"
          value={email}
          InputProps={{
            disableUnderline: true,
          }}
          onChange={handleEmailChange}
          className={shakeError ? 'shake-error' : ''}
        />
        <TextField
          id="password"
          label="Пароль"
          variant="filled"
          type="password"
          value={password}
          InputProps={{
            disableUnderline: true,
          }}
          onChange={handlePasswordChange}
          className={shakeError ? 'shake-error' : ''}
        />
        {isRegistering && (
          <TextField
            label="Подтвердить пароль"
            variant="filled"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            InputProps={{
              disableUnderline: true,
            }}
            className={shakeError ? 'shake-error' : ''}
          />
        )}

        {isRegistering && !isCodeRequested && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            className={shakeError ? 'shake-error' : ''}
            sx={{
              backgroundColor: '#fff',
              color: 'white',
              fontFamily: 'Montserrat',
              borderRadius: '30px',
              padding: '15px',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            Получить код
          </Button>
        )}

        {isCodeRequested && (
          <>
            <TextField
              label="Код подтверждения"
              variant="filled"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              className={shakeError ? 'shake-error' : ''}
              sx={{
                '& .MuiInputBase-root': {
                  '&::before': {
                    borderBottom: 'none',
                  },
                  '&::after': {
                    borderBottom: 'none',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleVerificationCodeSubmit}
              sx={{
                backgroundColor: '#fff',
                color: '#6346e8',
                borderRadius: '30px',
                padding: '15px',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              }}
            >
              Отправить
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default LoginRegistration;
