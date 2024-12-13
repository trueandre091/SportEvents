import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import { MenuItem, FormControlLabel, Switch } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import { getEvents } from '../api/event';
import MenuDrawer from '../components/MenuDrawer';
import { subscribeToEvent, unsubscribeToEvent, getProfile } from '../api/user';
import { useAuth } from '../context/AuthContext';

const filterFieldStyles = {
  bgcolor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.3)' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '10px', },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
  },
  '& input': { color: 'rgba(255, 255, 255, 0.3)' },
  '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.3)' },
  '& .MuiSelect-select': { color: 'rgba(255, 255, 255, 1)', fontFamily: 'Montserrat' },
  '& .MuiMenuItem-root': {
    fontFamily: 'Montserrat',
    color: 'rgba(255, 255, 255, 1)'
  }
};

const sortEventsByDate = (events) => {
  return [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
};

const Events = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isArchive, setIsArchive] = useState(false);
  const [filters, setFilters] = useState({
    date_start: '',
    date_end: '',
    discipline: '',
    region: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [disciplines, setDisciplines] = useState(new Set());
  const [statuses, setStatuses] = useState(new Set());
  const [regions, setRegions] = useState(new Set());
  const { userData, setUserData } = useAuth();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const toggleDetails = (index) => {
    setSelectedEventIndex(selectedEventIndex === index ? null : index);
  };

  // Загрузка событий
  useEffect(() => {
    const loadEvents = async () => {
      const response = await getEvents(isArchive);
      if (response.ok) {
        const filteredEvents = response.events.filter(event => event.status !== 'REJECTED');
        const sortedEvents = sortEventsByDate(filteredEvents);

        // Собираем уникальные значения
        const uniqueDisciplines = new Set(sortedEvents.map(event => event.discipline).filter(Boolean));
        const uniqueStatuses = new Set(sortedEvents.map(event => event.status).filter(Boolean));
        const uniqueRegions = new Set(sortedEvents.map(event => event.region).filter(Boolean));

        setDisciplines(uniqueDisciplines);
        setStatuses(uniqueStatuses);
        setRegions(uniqueRegions);

        setEvents(sortedEvents);
        setFilteredEvents(sortedEvents);
      }
    };
    loadEvents();
  }, [isArchive]);

  // Функция для преобразования даты из формата "DD.MM.YYYY HH:mm" в объект Date
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('.');
    const [hours, minutes] = timePart.split(':');
    return new Date(year, month - 1, day, hours, minutes);
  };

  // Фильтрация на фронтенде
  useEffect(() => {
    let result = [...events];

    if (filters.date_start || filters.date_end) {
      result = result.filter(event => {
        const eventStartDate = parseDate(event.date_start);
        const eventEndDate = parseDate(event.date_end);
        const [filterStartYear, filterStartMonth, filterStartDay] = (filters.date_start || '').split('-');
        const [filterEndYear, filterEndMonth, filterEndDay] = (filters.date_end || '').split('-');

        const filterStartDate = filters.date_start ? new Date(filterStartYear, filterStartMonth - 1, filterStartDay) : null;
        const filterEndDate = filters.date_end ? new Date(filterEndYear, filterEndMonth - 1, filterEndDay) : null;

        // Если указана только дата начала
        if (filterStartDate && !filterEndDate) {
          // Мероприятие длится в выбранный день или начинается позже
          return eventEndDate >= filterStartDate || eventStartDate >= filterStartDate;
        }

        // Если указана только дата окончания
        if (!filterStartDate && filterEndDate) {
          // Мероприятие длится в выбранный день или заканчивается до этого дня
          return eventStartDate <= filterEndDate || eventEndDate <= filterEndDate;
        }

        // Если указаны обе даты
        if (filterStartDate && filterEndDate) {
          // Мероприятие длится в промежутке или начинается/заканчивается в промежутке
          const startsInRange = eventStartDate >= filterStartDate && eventStartDate <= filterEndDate;
          const endsInRange = eventEndDate >= filterStartDate && eventEndDate <= filterEndDate;
          const spansRange = eventStartDate <= filterStartDate && eventEndDate >= filterEndDate;

          return startsInRange || endsInRange || spansRange;
        }

        return true;
      });
    }

    if (filters.discipline) {
      result = result.filter(event =>
        event.discipline?.toLowerCase().includes(filters.discipline.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(event =>
        event.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.region) {
      result = result.filter(event =>
        event.region?.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    // Сортируем отфильтрованные события
    result = sortEventsByDate(result);
    setFilteredEvents(result);
  }, [filters, events]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleArchiveToggle = () => {
    setIsArchive(prev => !prev);
  };

  const isSubscribed = (eventId) => {
    return userData?.notifications?.some(
      notification => notification.event_id === eventId
    ) || false;
  };

  const handleSubscribe = async (eventId) => {
    try {
      // Проверяем текущий статус подписки
      const currentlySubscribed = isSubscribed(eventId);

      // Используем соответствующую функцию API
      const response = currentlySubscribed
        ? await unsubscribeToEvent(eventId)
        : await subscribeToEvent(eventId);

      if (response.ok) {
        // Получаем обновленные данные пользователя
        const profileResponse = await getProfile();

        if (profileResponse.ok) {
          // Обновляем контекст пользователя новыми данными
          setUserData(profileResponse.user);
          console.log(`Успешная ${currentlySubscribed ? 'отписка от' : 'подписка на'} событие:`, eventId);
        } else {
          console.error('Ошибка при обновлении данных пользователя:', profileResponse.error);
        }
      } else {
        console.error(`Ошибка при ${currentlySubscribed ? 'отписке' : 'подписке'}:`, response.error);
      }
    } catch (error) {
      console.error('Ошибка при выполнении операции:', error);
    }
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
              circle at top right,
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
      <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} sx={{ position: 'fixed' }} />
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
              События
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: { md: "row", sm: "column" },
          justifyContent: 'flex-start',
          mb: 4,
          transform: { md: 'translateY(-20px) translateX(50px)', sm: 'translateY(-20px) translateX(0px)' }
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск событий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: { md: "600px", sm: "none" }, // Полная ширина на мобильных
              marginBottom: { md: "10px", sm: "0" },
              '& .MuiOutlinedInput-root': {
                borderRadius: '30px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#fff',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: '#fff',
                padding: '15px 20px',
                fontSize: '16px',
                fontFamily: 'Montserrat',
              },
              '& .MuiInputAdornment-root': {
                color: '#fff',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              background: "transparent",
              color: "#fff",
              textTransform: "none",
              fontFamily: "Montserrat",
              borderRadius: "20px",
              fontSize: "20px",
              boxShadow: "none",
              ":hover": { background: "#ffffff", color: "#000" },
              cursor: "pointer",
              transform: "translateY(-5px) translateX(15px)",
            }}
            disableRipple={true}
          >
            фильтры
            <FilterListIcon sx={{ fontSize: "30px", marginLeft: "10px" }} />
          </Button>
        </Box>

        {showFilters && (
          <Box sx={{
            display: 'flex',
            flexDirection: { md: "row", sm: "column" },
            justifyContent: 'space-between',
            gap: 2,
            mb: 4,
            padding: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            marginLeft: { md: "50px", sm: "0px" },
            marginRight: { md: "50px", sm: "0px" },
          }}>
            <TextField
              type="date"
              label="Начало"
              value={filters.date_start}
              onChange={(e) => handleFilterChange('date_start')(e)}
              InputLabelProps={{ shrink: true, style: { color: 'white', fontFamily: 'Montserrat' } }}
              sx={filterFieldStyles}
            />
            <TextField
              type="date"
              label="Окончание"
              value={filters.date_end}
              onChange={(e) => handleFilterChange('date_end')(e)}
              InputLabelProps={{ shrink: true, style: { color: 'white', fontFamily: 'Montserrat' } }}
              sx={filterFieldStyles}
            />
            <TextField
              select
              label="Дисциплина"
              value={filters.discipline}
              onChange={(e) => handleFilterChange('discipline')(e)}
              InputLabelProps={{ shrink: true, style: { color: 'white', fontFamily: 'Montserrat' } }}
              sx={{ ...filterFieldStyles, width: '25%' }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: '#313131',
                      '& .MuiMenuItem-root': {
                        fontFamily: 'Montserrat',
                        color: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)'
                        }
                      }
                    }
                  }
                }
              }}
            >
              <MenuItem value="">Все</MenuItem>
              {Array.from(disciplines).map((discipline) => (
                <MenuItem key={discipline} value={discipline}>
                  {discipline}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Статус"
              InputLabelProps={{ shrink: true, style: { color: 'white', fontFamily: 'Montserrat' } }}
              value={filters.status}
              onChange={(e) => handleFilterChange('status')(e)}
              sx={{ ...filterFieldStyles, width: '25%' }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: '#313131',
                      '& .MuiMenuItem-root': {
                        fontFamily: 'Montserrat',
                        color: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)'
                        }
                      }
                    }
                  }
                }
              }}
            >
              <MenuItem value="">Все</MenuItem>
              {Array.from(statuses).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Регион"
              value={filters.region}
              onChange={(e) => handleFilterChange('region')(e)}
              InputLabelProps={{ shrink: true, style: { color: 'white', fontFamily: 'Montserrat' } }}
              sx={{ ...filterFieldStyles, width: '25%' }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: '#313131',
                      '& .MuiMenuItem-root': {
                        fontFamily: 'Montserrat',
                        color: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)'
                        }
                      }
                    }
                  }
                }
              }}
            >
              <MenuItem value="">Все</MenuItem>
              {Array.from(regions).map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={isArchive}
                  onChange={handleArchiveToggle}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      color: 'grey.500',
                      '&.Mui-checked': {
                        color: '#e11946',
                        '& + .MuiSwitch-track': {
                          backgroundColor: '#e11946',
                          opacity: 0.5,
                        },
                      },
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'grey.500',
                      opacity: 0.3,
                    },
                  }}
                />
              }
              label="Архивные"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: 'white',
                  fontFamily: 'Montserrat',
                  fontSize: '16px'
                }
              }}
            />
          </Box>
        )}

        {filteredEvents
          .filter(event =>
            event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.discipline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.region?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((event, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: { sm: "10px", md: "40px" },
                marginBottom: { md: "50px", sm: "20px" },
                marginLeft: { md: "50px", sm: "0px" },
                marginRight: { md: "50px", sm: "0px" },
                background: "#402fff",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => toggleDetails(index)}
            >
              {event.status === "CONSIDERATION" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#ebbd34",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "15px",
                    fontSize: "12px",
                    fontFamily: "Montserrat",
                    zIndex: 1,
                  }}
                >
                  На рассмотрении
                </Box>
              )}

              <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: selectedEventIndex === index ? "20px" : "0px",
              }}>
                <Box sx={{ width: "65%" }}>
                  <Typography
                    sx={{
                      fontSize: { md: "20px", sm: "10px" },
                      color: "#fff",
                      fontFamily: "Montserrat",
                      marginBottom: "10px"
                    }}
                  >
                    {event.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { md: "16px", sm: "8px" },
                      color: "rgba(255, 255, 255, 0.7)",
                      fontFamily: "Montserrat",
                    }}
                  >
                    {event.sport} • {event.discipline}
                  </Typography>
                </Box>

                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <Box sx={{ textAlign: "right", marginRight: "20px" }}>
                    <CalendarIcon sx={{ fontSize: "30px", marginRight: "10px" }} />
                    <Typography
                      sx={{
                        fontSize: { md: "16px", sm: "8px" },
                        color: "#fff",
                        fontFamily: "Montserrat",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.date_start.split(' ')[0]}
                      {event.date_end && ` - ${event.date_end.split(' ')[0]}`}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { md: "14px", sm: "8px" },
                        color: "rgba(255, 255, 255, 0.7)",
                        fontFamily: "Montserrat",
                      }}
                    >
                      {event.place}
                    </Typography>
                  </Box>

                  <Box>
                    {!isArchive && <Button
                      onClick={(e) => {
                        e.stopPropagation(); // Предотвращаем всплытие события
                        handleSubscribe(event.id);
                      }}
                      sx={{
                        position: 'relative',
                        borderRadius: '20px',
                        backgroundColor: isSubscribed(event.id) ? '#ff1f75' : 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: isSubscribed(event.id) ? '#d41960' : 'rgba(255, 255, 255, 0.3)',
                        },
                        padding: '5px 15px',
                        fontSize: '14px',
                        fontFamily: 'Montserrat',
                      }}
                    >
                      {isSubscribed(event.id) ? 'Отписаться' : 'Подписаться'}
                    </Button>
                    }
                  </Box>
                </Box>
              </Box>

              {selectedEventIndex === index && (
                <Box
                  sx={{
                    marginTop: "10px",
                    padding: "20px",
                    background: "#2e2e2e",
                    color: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    transform: { md: "translateX(-20px)", sm: "translateX(0px)" },
                    width: "65%",
                  }}
                >
                  <Typography sx={{
                    fontSize: { md: "16px", sm: "10px" },
                    fontFamily: "Montserrat",
                    marginBottom: "10px"
                  }}>
                    {event.description || "Описание отсутствует"}
                  </Typography>
                  {event.participants && (
                    <Typography sx={{
                      fontSize: { md: "14px", sm: "8px" },
                      fontFamily: "Montserrat",
                      color: "rgba(255, 255, 255, 0.7)"
                    }}>
                      {event.participants}
                    </Typography>
                  )}
                  {event.participants_num && (
                    <Typography sx={{
                      fontSize: { md: "14px", sm: "8px" },
                      fontFamily: "Montserrat",
                      color: "rgba(255, 255, 255, 0.7)"
                    }}>
                      Количество участников: {event.participants_num}
                    </Typography>
                  )}
                  {event.files && event.files.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{
                        fontSize: { md: "14px", sm: "10px" },
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                        marginBottom: "10px"
                      }}>
                        Прикрепленные файлы:
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}>
                        {event.files.map((file, fileIndex) => (
                          <Box
                            key={fileIndex}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {file.mime_type.startsWith('image/') ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <Typography sx={{ fontSize: '20px' }}>
                                    📄
                                  </Typography>
                                </Box>
                              )}
                              <Box>
                                <Typography sx={{
                                  fontSize: { md: "14px", sm: "8px" },
                                  fontFamily: "Montserrat",
                                }}>
                                  {file.name}
                                </Typography>
                                <Typography sx={{
                                  fontSize: { md: "12px", sm: "8px" },
                                  fontFamily: "Montserrat",
                                  color: "rgba(255, 255, 255, 0.5)"
                                }}>
                                  {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploaded_at).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: '#fff',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                                },
                                fontSize: { md: "12px", sm: "8px" },
                                fontFamily: "Montserrat",
                              }}
                            >
                              Скачать
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export default Events;