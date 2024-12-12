import React from 'react';
import { Box, Typography, Grid, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import { Link } from 'react-router-dom';

const About = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const features = [
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 60, color: '#ff1f75' }} />,
      title: 'Соревнования',
      description: 'Проводим соревнования национального уровня, формируем сборные команды'
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 60, color: '#ff1f75' }} />,
      title: 'Сообщество',
      description: 'Развиваем клубы и секции, создаем активное сообщество программистов'
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 60, color: '#ff1f75' }} />,
      title: 'Обучение',
      description: 'Занимаемся обучением и аттестацией спортивных судей'
    },
    {
      icon: <PublicIcon sx={{ fontSize: 60, color: '#ff1f75' }} />,
      title: 'Развитие',
      description: 'Популяризируем спортивное программирование в России'
    }
  ];

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

      <IconButton onClick={toggleDrawer} sx={{ position: "absolute", top: "10px", left: "40px", color: "white", flexDirection: "row" }}>
        <MenuIcon />
        <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontSize: "25px", transform: "translateX(10px)" }}>
          Меню
        </Typography>
      </IconButton>

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { md: "20%", sm: "60%" },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Box onClick={toggleDrawer} sx={{ display: "flex", flexDirection: "row", alignItems: "center", cursor: "pointer" }}>
            <MenuIcon sx={{ fontSize: "30px", marginLeft: "25px", marginTop: "15%" }} />
            <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontSize: "25px", marginLeft: "10px", marginTop: "15%" }}>
              Меню
            </Typography>
          </Box>
          <Box sx={{ position: "absolute", left: "10%", top: "10%", height: "80%", width: "3px", background: "#000" }} />
        </Box>
        <List sx={{ marginLeft: "50px", marginTop: "10%" }}>
          {[
            { text: "профиль", link: "/profile" },
            { text: "регионы", link: "/regions" },
            { text: "контакты", link: "/contacts" },
            { text: "события", link: "/events" },
            { text: "на главную", link: "/" }
          ].map(({ text, link }) => (
            <Link to={link} style={{ textDecoration: "none", color: "inherit" }} key={text}>
              <ListItem button>
                <ListItemText primary={text} primaryTypographyProps={{ fontFamily: "Montserrat", fontSize: "30px" }} />
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
        <Box sx={{ padding: 4 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Montserrat',
              fontSize: { md: '40px', sm: '30px' },
              fontWeight: 'bold',
              marginBottom: 4,
              textAlign: 'center'
            }}
          >
            О Федерации спортивного программирования
          </Typography>

          <Typography
            sx={{
              fontFamily: 'Montserrat',
              fontSize: { md: '18px', sm: '16px' },
              marginBottom: 6,
              lineHeight: 1.8,
              textAlign: 'justify'
            }}
          >
            Федерация спортивного программирования - это общественная спортивная организация, которая развивает и популяризирует спортивное программирование в России. Мы проводим соревнования национального уровня, формируем сборные команды и создаем условия для развития этого уникального вида спорта.
          </Typography>

          <Grid container spacing={4} sx={{ marginTop: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  {feature.icon}
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Montserrat',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      marginY: 2
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Montserrat',
                      fontSize: '16px',
                      textAlign: 'center',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default About;