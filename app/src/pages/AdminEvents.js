import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, InputAdornment, IconButton, Modal, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { MenuItem, FormControlLabel, Switch } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getEvents } from '../api/event';
import MenuDrawer from '../components/MenuDrawer';
import EventModal from '../components/EventModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


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

const AdminEvents = () => {
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
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const isCentralAdmin = () => {
    return ['ADMIN', 'CENTRAL_ADMIN'].includes(userData?.role);
  };

  const isRegionAdmin = () => {
    return ['REGION_ADMIN'].includes(userData?.role);
  };

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
        const sortedEvents = sortEventsByDate(response.events);

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
        const filterStartDate = filters.date_start ? new Date(filters.date_start) : null;
        const filterEndDate = filters.date_end ? new Date(filters.date_end) : null;

        // Проверяем условия фильтрации
        const passesStartFilter = !filterStartDate || eventStartDate >= filterStartDate;
        const passesEndFilter = !filterEndDate || eventEndDate <= filterEndDate;

        return passesStartFilter && passesEndFilter;
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

  const handleCreateEvent = (eventData) => {
    // Здесь логика создания события
    console.log(eventData);
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
              circle at bottom right,
              #9c9c9c -10%,
              #a6768c 10%,
              rgba(26, 26, 26, 0.1) 50%
            ),
            radial-gradient(
              circle at top left,
              #9c9c9c -10%,
              #a6768c 10%,
              rgba(26, 26, 26, 0.1) 50%
            )
          `,
          zIndex: -1,
        }}
      >
      </Box>
      <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} sx={{ position: 'fixed' }} />
      <Box
        sx={{
          maxWidth: { md: "85%", sm: "none" },
          margin: { md: "auto", sm: "20px" },
          marginTop: { md: "50px", sm: "5%" },
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
          gap: 2,
          transform: { md: 'translateY(-20px) translateX(50px)', sm: 'translateY(-20px) translateX(0px)' }
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск событий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
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
              transform: "translateY(-10px) translateX(15px)",
              minWidth: "200px",
            }}
            disableRipple={true}
          >
            фильтры
            <FilterListIcon sx={{ fontSize: "30px", marginLeft: "10px" }} />
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
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
              transform: "translateY(-10px) translateX(15px)",
            }}
            disableRipple={true}
          >
            добавить событие
            <AddIcon sx={{ fontSize: "30px", marginLeft: "10px" }} />
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
            {isCentralAdmin && <TextField
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
            }
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
            event.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                    {event.discipline}
                  </Typography>
                </Box>

                <Box sx={{ width: "10%" }}>
                  <Typography sx={{
                    fontSize: { md: "14px", sm: "8px" },
                    color: "rgba(255, 255, 255, 0.7)",
                    fontFamily: "Montserrat",
                  }}>
                    {event.region}
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

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Функция редактирования
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Функция удаления
                      }}
                    >
                      <ArchiveIcon />
                    </IconButton>
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

                </Box>
              )}
            </Box>
          ))}
      </Box>
      <EventModal 
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateEvent}
      />
    </Box>
  );
};

export default AdminEvents;