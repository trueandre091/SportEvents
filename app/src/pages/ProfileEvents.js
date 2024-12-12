import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Button,
  Tooltip,
  Switch,
  FormControlLabel,
  TextField
} from '@mui/material';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuDrawer from '../components/MenuDrawer';
import { useAuth } from '../context/AuthContext';
import { unsubscribeToEvent, getProfile, setupNotification } from '../api/user';
import { getNotifications } from '../api/user';
import { convertToMoscowTime, formatMoscowDate } from '../utils/dateUtils';
import NotificationsIcon from '@mui/icons-material/Notifications';

const UserEvents = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [events, setEvents] = useState([]);
  const { userData, setUserData } = useAuth();
  const [notificationTime, setNotificationTime] = useState({});
  const [switchStates, setSwitchStates] = useState({});
  const [error, setError] = useState(null);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const loadEvents = async () => {
    try {
      const response = await getNotifications();
      console.log('Ответ от API:', response);
      
      if (response.ok) {
        setEvents(response.events);
      } else {
        console.error('Ошибка при загрузке событий:', response.error);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке событий:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      loadEvents();
    }
  }, [userData]);

  const handleUnsubscribe = async (eventId) => {
    try {
      const response = await unsubscribeToEvent(eventId);
      
      if (response.ok) {
        const profileResponse = await getProfile();
        
        if (profileResponse.ok) {
          setUserData(profileResponse.user);
          console.log('Успешная отписка от события:', eventId);
        } else {
          console.error('Ошибка при обновлении данных пользователя:', profileResponse.error);
        }
      } else {
        console.error('Ошибка при отписке:', response.error);
      }
    } catch (error) {
      console.error('Ошибка при выполнении отписки:', error);
    }
  };

  const getTimeStatus = (dateStart, dateEnd) => {
    const now = convertToMoscowTime(new Date());
    const start = convertToMoscowTime(dateStart);
    const end = dateEnd ? convertToMoscowTime(dateEnd) : null;

    const formatTimeDiff = (diff) => {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days} д. ${hours} ч.`;
      }
      return `${hours} ч.`;
    };

    if (now < start) {
      const diff = start - now;
      return {
        text: `До начала: ${formatTimeDiff(diff)}`,
        color: '#402fff'
      };
    } else if (end && now > end) {
      const diff = now - end;
      return {
        text: `Завершено ${formatTimeDiff(diff)} назад`,
        color: '#ff1f75'
      };
    } else {
      return {
        text: 'Событие идет сейчас',
        color: '#4CAF50'
      };
    }
  };

  const handleNotificationSetup = async (eventId, data) => {
    try {
      const response = await setupNotification(eventId, data);
      console.log(data)
      
      if (response.ok) {
        const profileResponse = await getProfile();
        if (profileResponse.ok) {
          setUserData(profileResponse.user);
        } else {
          console.error('Ошибка при обновлении профиля:', profileResponse.error);
        }
      } else {
        console.error('Ошибка при настройке уведомлений:', response.error);
      }
    } catch (error) {
      console.error('Ошибка при настройке уведомлений:', error);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateForApi = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleDateTimeChange = (e, eventId, event) => {
    const dateValue = e.target.value;
    
    setNotificationTime(prev => ({
      ...prev,
      [eventId]: dateValue
    }));
    
    if (dateValue && dateValue.includes('T')) {
      const [date, time] = dateValue.split('T');
      if (date && time) {
        handleNotificationSetup(eventId, {
          ...event,
          notification_time: formatDateForApi(dateValue)
        });
      }
    }
  };

  const handleSwitchChange = async (e, eventId, field) => {
    setError(null);

    setSwitchStates(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: e.target.checked
      }
    }));

    const currentNotification = userData?.notifications?.find(n => n.event_id === eventId) || {};
    
    const updatedData = {
      notification_time: currentNotification.notification_time || null,
      email: field === 'email' ? e.target.checked : (currentNotification.email || false),
      telegram: field === 'telegram' ? e.target.checked : (currentNotification.telegram || false)
    };

    const response = await setupNotification(eventId, updatedData);
    
    if (!response.ok) {
      setSwitchStates(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          [field]: !e.target.checked
        }
      }));

      if (response.error?.includes('User has no telegram id')) {
        setError('Для настройки уведомлений необходимо добавить Telegram ID в профиле.');
      } else {
        console.error('Ошибка при настройке уведомлений:', response.error);
      }
    }
  };

  useEffect(() => {
    console.log('userData notifications updated:', userData?.notifications);
  }, [userData?.notifications]);

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
      
      <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} sx={{ position: 'fixed' }} />
      
      <Box sx={{ 
        maxWidth: { md: "80%", sm: "95%" },
        margin: "auto",
        mt: 4,
        p: 3
      }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat',
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#fff',
            mb: 4
          }}
        >
          Ваши подписки
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : events && events.length > 0 ? (
          <Stepper 
            activeStep={activeStep} 
            orientation="vertical"
            nonLinear
            sx={{
              '& .MuiStepConnector-line': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '& .MuiStepLabel-label': {
                color: 'white',
                fontFamily: 'Montserrat',
              },
              '& .MuiStepLabel-iconContainer': {
                '& .MuiStepIcon-root': {
                  color: '#402fff',
                  '&.Mui-active': {
                    color: '#ff1f75',
                  },
                },
              },
            }}
          >
            {events.map((event, index) => (
              <Step key={index} expanded>
                <StepLabel
                  onClick={() => setActiveStep(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}>
                    <Typography sx={{
                      fontSize: { md: "20px", sm: "16px" },
                      color: "#fff",
                      fontFamily: "Montserrat",
                    }}>
                      {event.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Tooltip title="Время до/после события">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ color: getTimeStatus(event.date_start, event.date_end).color }} />
                          <Typography sx={{
                            fontSize: { md: "14px", sm: "12px" },
                            color: getTimeStatus(event.date_start, event.date_end).color,
                            fontFamily: "Montserrat",
                          }}>
                            {getTimeStatus(event.date_start, event.date_end).text}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Typography sx={{
                        fontSize: { md: "16px", sm: "14px" },
                        color: "rgba(255, 255, 255, 0.7)",
                        fontFamily: "Montserrat",
                      }}>
                        {event.sport}
                      </Typography>
                    </Box>
                  </Box>
                </StepLabel>
                <StepContent>
                  <Paper sx={{
                    bgcolor: 'rgba(64, 47, 255, 0.3)',
                    p: 3,
                    borderRadius: '12px',
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <Box>
                          <Typography sx={{
                            fontSize: { md: "16px", sm: "14px" },
                            color: "#fff",
                            fontFamily: "Montserrat",
                            mb: 1
                          }}>
                            {event.description || "Описание отсутствует"}
                          </Typography>
                          <Typography sx={{
                            fontSize: { md: "14px", sm: "12px" },
                            color: "rgba(255, 255, 255, 0.7)",
                            fontFamily: "Montserrat",
                          }}>
                            Место проведения: {event.place}
                          </Typography>
                          {event.participants_num && (
                            <Typography sx={{
                              fontSize: { md: "14px", sm: "12px" },
                              color: "rgba(255, 255, 255, 0.7)",
                              fontFamily: "Montserrat",
                            }}>
                              Количество участников: {event.participants_num}
                            </Typography>
                          )}
                          {event.region && (
                            <Typography sx={{
                              fontSize: { md: "14px", sm: "12px" },
                              color: "rgba(255, 255, 255, 0.7)",
                              fontFamily: "Montserrat",
                            }}>
                              Регион: {event.region}
                            </Typography>
                          )}
                          <Typography sx={{
                            fontSize: { md: "14px", sm: "12px" },
                            color: "rgba(255, 255, 255, 0.7)",
                            fontFamily: "Montserrat",
                          }}>
                            Дата начала: {formatMoscowDate(event.date_start)}
                          </Typography>
                          {event.date_end && (
                            <Typography sx={{
                              fontSize: { md: "14px", sm: "12px" },
                              color: "rgba(255, 255, 255, 0.7)",
                              fontFamily: "Montserrat",
                            }}>
                              Дата окончания: {formatMoscowDate(event.date_end)}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          onClick={() => handleUnsubscribe(event.id)}
                          sx={{
                            borderRadius: '20px',
                            backgroundColor: '#ff1f75',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#d41960',
                            },
                            padding: '5px 15px',
                            fontSize: '14px',
                            fontFamily: 'Montserrat',
                          }}
                        >
                          Отписаться
                        </Button>
                      </Box>
                      
                      <Box sx={{ 
                        mt: 2,
                        p: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px'
                      }}>
                        <Typography sx={{
                          fontSize: { md: "16px", sm: "14px" },
                          color: "#fff",
                          fontFamily: "Montserrat",
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <NotificationsIcon /> Настройки уведомлений
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <input
                            type="datetime-local"
                            value={notificationTime[event.id] || formatDateForInput(
                              userData?.notifications?.find(n => n.event_id === event.id)?.notification_time
                            )}
                            onChange={(e) => handleDateTimeChange(e, event.id, event)}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '4px',
                              padding: '8px',
                              color: 'white',
                              fontFamily: 'Montserrat',
                              width: '100%'
                            }}
                          />

                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={
                                    switchStates[event.id]?.['email'] !== undefined 
                                      ? switchStates[event.id]?.['email'] 
                                      : userData?.notifications?.some(n => n.event_id === event.id && n.email) || false
                                  }
                                  onChange={(e) => handleSwitchChange(e, event.id, 'email')}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: '#ff1f75',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: '#ff1f75',
                                    },
                                  }}
                                />
                              }
                              label="Email уведомления"
                              sx={{
                                fontFamily: 'Montserrat',
                                color: '#fff',
                              }}
                            />

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={
                                    switchStates[event.id]?.['telegram'] !== undefined 
                                      ? switchStates[event.id]?.['telegram'] 
                                      : userData?.notifications?.some(n => n.event_id === event.id && n.telegram) || false
                                  }
                                  onChange={(e) => handleSwitchChange(e, event.id, 'telegram')}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: '#402fff',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: '#402fff',
                                    },
                                  }}
                                />
                              }
                              label="Telegram уведомления"
                              sx={{
                                fontFamily: 'Montserrat',
                                color: '#fff',
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        ) : (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontFamily: 'Montserrat' }}>
              У вас пока нет подписок на мероприятия
            </Typography>
          </Box>
        )}
      </Box>
      
      {error && (
        <Box 
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 31, 117, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            maxWidth: '90%',
            fontFamily: 'Montserrat'
          }}
        >
          <Typography sx={{ fontSize: '14px' }}>
            {error}
          </Typography>
          <Button 
            variant="text" 
            color="inherit" 
            size="small"
            onClick={() => setError(null)}
            sx={{ 
              minWidth: 'auto',
              padding: '4px 8px',
              fontSize: '12px'
            }}
          >
            Закрыть
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UserEvents;