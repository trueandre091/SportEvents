import * as React from 'react';
import './styles/LoginRegistration.css';
import useLoginRegistration from './states/useLoginRegistration';
import { Box, Typography, TextField, Button, Collapse, Fade } from '@mui/material';

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
    isCodeRequested,
    error,
    shakeError,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleVerificationCodeChange,
    handleSubmit,
    handleVerificationCodeSubmit,
    toggleForm,
    userData,
    token,
    isForgotPassword,
    handleForgotPassword,
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
      {!token && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <Button
              sx={{
                marginBottom: '20px',
                color: 'black',
                fontFamily: 'Montserrat',
                fontSize: '16px',
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
              {!isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '40px',
                marginTop: !isRegistering ? isForgotPassword ? "100px" : "160px" : "-20px",
                transition: "all 0.5s ease-in-out",
                animation: isRegistering ? "form-enter 0.5s ease-in-out" : "form-exit 0.5s ease-in-out"
              }}>
              {isForgotPassword ? 'Восстановление' : isRegistering ? 'Регистрация' : 'Войти'}
            </Typography>
            {!isRegistering && !isForgotPassword && (
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
                onClick={handleForgotPassword}
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
                marginBottom: '10px',
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
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 3,
              transition: 'all 0.5s ease-in-out'
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
              disabled={isRegistering && isCodeRequested ? true : false}
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
              disabled={isRegistering && isCodeRequested ? true : false}
            />
            {isRegistering && (
              <TextField
                label="Подтвердить пароль"
                variant="filled"
                type="password"
                value={confirmPassword}
                InputProps={{
                  disableUnderline: true,
                }}
                className={shakeError ? 'shake-error' : ''}
                disabled={isCodeRequested ? true : false}
              />
            )}

            <Fade in={((isRegistering && !isCodeRequested) || (!isRegistering && isForgotPassword))} timeout={500}>
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
            </Fade>

            {isRegistering && isCodeRequested && (
              <>
                <TextField
                  label="Код подтверждения"
                  variant="filled"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  className={shakeError ? 'shake-error' : ''}
                  InputProps={{
                    disableUnderline:
                      true,
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
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s ease-in-out',
                    }
                  }}
                >
                  Отправить
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}


      {token && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat',
              fontSize: '40px',
              marginTop: '-20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}>
            👋
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat',
              fontSize: '40px',
            }}>
            Добро пожаловать, Пользователь!
          </Typography>
        </Box>
      )}

    </Box>
  );
};

export default LoginRegistration;
