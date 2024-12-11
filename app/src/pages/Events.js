import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconButton, Drawer, List, ListItem, ListItemText, Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

const events = [
  {
    title: "Международные соревнования по искусственному интеллекту, дизайн-мышлению и проектированию",
    date: "6 декабря",
  },
  {
    title: "Чемпионат и Первенство России по спортивному программированию (продуктовое)",
    date: "6 декабря",
  },
];

const Events = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  const toggleDetails = (index) => {
    setSelectedEventIndex(selectedEventIndex === index ? null : index);
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
          position: 'absolute',
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
      <IconButton onClick={toggleDrawer(true)} sx={{ position: "absolute", top: "10px", left: "40px", color: "white", flexDirection: "row" }}>
        <MenuIcon />
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Montserrat",
            fontSize: "25px",
            transform: "translateX(10px)",
            cursor: "pointer",
          }}
        >
          Меню
        </Typography>
      </IconButton>
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { md: "20%", sm: "60%" }, // Для мобильных устройств уже
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Box onClick={toggleDrawer(false)} sx={{ display: "flex", flexDirection: "row", alignItems: "center", cursor: "pointer" }}>
            <MenuIcon sx={{ fontSize: "30px", marginLeft: "25px", marginTop: "15%" }} />
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Montserrat",
                fontSize: "25px",
                marginLeft: "10px",
                marginTop: "15%",
                cursor: "pointer",
              }}
            >
              Меню
            </Typography>
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "10%",
              top: "10%",
              height: "80%",
              width: "3px",
              background: "#000", // Цвет полоски
            }}
          />
        </Box>
        <List sx={{ marginLeft: "50px", marginTop: "10%" }}>
          {[
            { text: "профиль", link: "/profile" },
            { text: "регионы", link: "/regions" },
            { text: "контакты", link: "/contacts" },
            { text: "о нас", link: "/about" },
            { text: "на главную", link: "/" }
          ].map(({ text, link }) => (
            <Link to={link} style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button key={text}>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    fontFamily: "Montserrat", // Задаём шрифт
                    fontSize: "30px",         // Задаём размер текста
                  }} />
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
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
              transform: "translateY(-5px)",
            }}
          >
            фильтры
            <FilterListIcon sx={{ fontSize: "30px", marginLeft: "10px" }} />
          </Button>
        </Box>

        {events
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
                bomdhadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                cursor: "pointer",
              }}
              onClick={() => toggleDetails(index)}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: selectedEventIndex === index ? "20px" : "0px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { md: "20px", sm: "10px" },
                    color: "#fff",
                    fontFamily: "Montserrat",
                    width: "65%",
                  }}
                >
                  {event.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <CalendarIcon sx={{ fontSize: "50px", marginRight: "20px" }} />
                  <Typography
                    sx={{
                      fontSize: { md: "30px", sm: "10px" },
                      color: "#fff",
                      fontFamily: "Montserrat",
                      transform: "translateX(-10px)",
                      whiteSpace: "nowrap",         // Запрещаем перенос строки
                      overflow: "hidden",           // Скрываем выходящий за пределы текст
                      textOverflow: "ellipsis",     // Добавляем многоточие в конце
                      maxWidth: "100%",             // Ограничиваем максимальную ширину
                    }}
                  >
                    {event.date}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    sx={{
                      background: "#e11946",
                      color: "#fff",
                      textTransform: "none",
                      fontSize: { md: "15px", sm: "10px" },
                      fontFamily: "Montserrat",
                      borderRadius: "20px",
                      boxShadow: "none",
                      ":hover": {
                        background: "#e11946",
                      },
                      cursor: "default",
                    }}
                  >
                    подписаться
                  </Button>
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
                  <Typography sx={{ fontSize: { md: "16px", sm: "10px" }, fontFamily: "Montserrat" }}>
                    {event.description}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export default Events;