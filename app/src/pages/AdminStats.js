import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import * as XLSX from 'xlsx';
import MenuDrawer from '../components/MenuDrawer';
import { getUsers } from '../api/user';
import { getEvents } from '../api/event';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    regionalAdmins: 0,
    centralAdmins: 0,
    regionsCount: 0,
    regionsWithEvents: 0,
    totalEvents: 0,
    activeEvents: 0,
    archivedEvents: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const parseDateFromRussianFormat = (dateStr) => {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('.');
    return `${year}-${month}-${day} ${timePart}`;
  };

  const fetchData = async () => {
    try {
      // Получаем пользователей всех ролей
      const [
        adminResponse,
        centralAdminResponse,
        regionalAdminResponse,
        userResponse,
        eventsResponse
      ] = await Promise.all([
        getUsers('ADMIN'),
        getUsers('CENTRAL_ADMIN'),
        getUsers('REGIONAL_ADMIN'),
        getUsers('USER'),
        getEvents(false)
      ]);

      console.log('API Responses:', {
        admin: adminResponse,
        centralAdmin: centralAdminResponse,
        regionalAdmin: regionalAdminResponse,
        user: userResponse,
        events: eventsResponse
      });

      // Проверяем успешность ответов
      if (!eventsResponse?.ok) {
        console.error('Invalid events response:', eventsResponse);
        return;
      }

      // Объединяем всех пользователей
      const allUsers = [
        ...(adminResponse?.ok ? adminResponse.users : []),
        ...(centralAdminResponse?.ok ? centralAdminResponse.users : []),
        ...(regionalAdminResponse?.ok ? regionalAdminResponse.users : []),
        ...(userResponse?.ok ? userResponse.users : [])
      ];

      // Фильтруем события по выбранному периоду
      const filteredEvents = eventsResponse.events.filter(event => {
        const eventStart = dayjs(parseDateFromRussianFormat(event.date_start));
        const eventEnd = dayjs(parseDateFromRussianFormat(event.date_end));
        
        if (!eventStart.isValid() || !eventEnd.isValid()) {
          console.warn('Invalid date format for event:', event);
          return false;
        }

        const isInRange = eventStart.isBetween(startDate, endDate, 'day', '[]') || 
                         eventEnd.isBetween(startDate, endDate, 'day', '[]') ||
                         (eventStart.isBefore(startDate) && eventEnd.isAfter(endDate));
        
        console.log('Event date check:', {
          event: event.title,
          date_start: event.date_start,
          date_end: event.date_end,
          eventStart: eventStart.format('YYYY-MM-DD'),
          eventEnd: eventEnd.format('YYYY-MM-DD'),
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          isInRange
        });
        
        return isInRange;
      });

      console.log('Filtered events:', filteredEvents);

      // Обновляем статистику
      const regions = new Set(filteredEvents.map(event => event.region).filter(Boolean));
      const activeEvents = filteredEvents.filter(event => {
        const eventEnd = dayjs(parseDateFromRussianFormat(event.date_end));
        return eventEnd.isValid() && eventEnd.isAfter(dayjs());
      });

      const newStats = {
        totalUsers: allUsers.length,
        verifiedUsers: allUsers.filter(user => user.verified).length,
        regionalAdmins: regionalAdminResponse?.ok ? regionalAdminResponse.users.length : 0,
        centralAdmins: centralAdminResponse?.ok ? centralAdminResponse.users.length : 0,
        regionsCount: regions.size,
        regionsWithEvents: regions.size,
        totalEvents: filteredEvents.length,
        activeEvents: activeEvents.length,
        archivedEvents: filteredEvents.length - activeEvents.length
      };

      console.log('New stats:', newStats);
      console.log('Users by role:', {
        admins: adminResponse?.ok ? adminResponse.users.length : 0,
        centralAdmins: centralAdminResponse?.ok ? centralAdminResponse.users.length : 0,
        regionalAdmins: regionalAdminResponse?.ok ? regionalAdminResponse.users.length : 0,
        users: userResponse?.ok ? userResponse.users.length : 0,
        total: allUsers.length
      });

      setEvents(filteredEvents);
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const StatBox = ({ title, value, description }) => (
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '20px',
        textAlign: 'center',
        minWidth: '200px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'transform 0.3s ease, background-color 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        }
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat',
          fontWeight: 'bold',
          color: '#fff',
          fontSize: { xs: '24px', sm: '32px' }
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Montserrat',
          color: '#fff',
          fontSize: { xs: '16px', sm: '20px' }
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            fontFamily: 'Montserrat',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '12px', sm: '14px' }
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );

  const generateExcel = () => {
    // Создаем книгу Excel
    const wb = XLSX.utils.book_new();
    
    // Данные общей статистики
    const statsData = [
      ['Статистика платформы'],
      [`Период: ${startDate.format('DD.MM.YYYY')} - ${endDate.format('DD.MM.YYYY')}`],
      [],
      ['Показатель', 'Значение'],
      ['Всего пользователей', stats.totalUsers],
      ['Верифицированных пользователей', stats.verifiedUsers],
      ['Региональных администраторов', stats.regionalAdmins],
      ['Центральных администраторов', stats.centralAdmins],
      ['Всего регионов', stats.regionsCount],
      ['Регионов с событиями', stats.regionsWithEvents],
      ['Всего событий', stats.totalEvents],
      ['Активных событий', stats.activeEvents],
      ['Архивных событий', stats.archivedEvents],
    ];

    // Создаем лист со стат��стикой
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Общая статистика');

    // Данные событий
    const eventsData = [
      ['Список событий за период'],
      [],
      ['Название', 'Дисциплина', 'Регион', 'Дата начала', 'Дата окончания', 'Статус']
    ];

    // Добавляем данные событий
    events.forEach(event => {
      eventsData.push([
        event.title,
        event.discipline,
        event.region,
        event.date_start,
        event.date_end,
        event.status
      ]);
    });

    // Создаем лист с событиями
    const wsEvents = XLSX.utils.aoa_to_sheet(eventsData);
    XLSX.utils.book_append_sheet(wb, wsEvents, 'События');

    // Настраиваем ширину колонок для обоих листов
    const statsRange = XLSX.utils.decode_range(wsStats['!ref']);
    const eventsRange = XLSX.utils.decode_range(wsEvents['!ref']);

    // Функция для автоматической установки ширины колонок
    const setColumnWidths = (ws, range) => {
      const widths = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        let maxWidth = 10; // Минимальная ширина
        for (let R = range.s.r; R <= range.e.r; R++) {
          const cell = ws[XLSX.utils.encode_cell({r: R, c: C})];
          if (cell && cell.v) {
            const textWidth = String(cell.v).length;
            maxWidth = Math.max(maxWidth, textWidth);
          }
        }
        widths[C] = maxWidth;
      }
      ws['!cols'] = widths.map(w => ({wch: w}));
    };

    setColumnWidths(wsStats, statsRange);
    setColumnWidths(wsEvents, eventsRange);

    // Сохраняем файл
    const fileName = `Статистика_${dayjs().format('DD_MM_YYYY')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };



  return (
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
      backgroundSize: 'cover',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
      <IconButton
        onClick={() => navigate('/admin')}
        sx={{
          position: "fixed",
          top: "10px",
          left: "180px",
          color: "white",
          flexDirection: "row"
        }}
      >
        <ArrowBackIcon />
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Montserrat",
            fontSize: "25px",
            transform: "translateX(10px)",
            cursor: "pointer",
          }}
        >
          Назад в admin панель
        </Typography>
      </IconButton>
      
      <Box sx={{
        maxWidth: { md: "85%", sm: "95%" },
        margin: "auto",
        marginTop: { md: "100px", sm: "80px" },
        padding: "20px",
      }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Montserrat',
            color: '#fff',
            marginBottom: '40px',
            textAlign: 'center'
          }}
        >
          Статистика платформы
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          marginBottom: 4,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
            <DatePicker
              label="Дата начала"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                '& .MuiInputBase-root': {
                  color: '#fff',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '& .MuiIconButton-root': {
                  color: '#fff',
                },
              }}
            />
            <DatePicker
              label="Дата конца"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                '& .MuiInputBase-root': {
                  color: '#fff',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '& .MuiIconButton-root': {
                  color: '#fff',
                },
              }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={generateExcel}
            sx={{
              backgroundColor: '#2196f3',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1976d2',
              },
              height: '56px',
            }}
          >
            Скачать отчет
          </Button>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 3,
          marginBottom: 4
        }}>
          <StatBox
            title="Всего пользователей"
            value={stats.totalUsers}
            description="Общее количество пользователей в системе"
          />
          <StatBox
            title="Верифицированные"
            value={stats.verifiedUsers}
            description="Количество верифицированных пользователей"
          />
          <StatBox
            title="Региональные админы"
            value={stats.regionalAdmins}
            description="Количество региональных администраторов"
          />
          <StatBox
            title="Центральные админы"
            value={stats.centralAdmins}
            description="Количество центральных администраторов"
          />
          <StatBox
            title="Всего событий"
            value={stats.totalEvents}
            description={`Активных: ${stats.activeEvents}, Архивных: ${stats.archivedEvents}`}
          />
          <StatBox
            title="Регионы"
            value={stats.regionsCount}
            description={`Регионов с событиями: ${stats.regionsWithEvents}`}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminStats;
