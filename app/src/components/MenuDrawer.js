import React from 'react';
import { 
  Drawer, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  IconButton 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MenuDrawer = ({ isOpen, toggleDrawer }) => {
  const { userData } = useAuth();
  const handleToggle = () => {
    toggleDrawer();
  };

  const isCentralAdmin = () => {
    return ['ADMIN', 'CENTRAL_ADMIN'].includes(userData?.role);
  };

  const isRegionalAdmin = () => {
    return ['REGIONAL_ADMIN'].includes(userData?.role);
  };

  return (
    <>
      <IconButton 
        onClick={handleToggle}
        sx={{ 
          position: "fixed", 
          top: "10px", 
          left: "40px", 
          color: "white", 
          flexDirection: "row" 
        }}
      >
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
        onClose={handleToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: { md: "20%", sm: "60%" },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Box onClick={handleToggle} sx={{ display: "flex", flexDirection: "row", alignItems: "center", cursor: "pointer" }}>
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
              background: "#000",
            }}
          />
        </Box>
        <List sx={{ marginLeft: "50px", marginTop: "10%" }}>
          {[
            { text: "события", link: "/events" },
            { text: "профиль", link: "/profile" },
            { text: "подписки", link: "/profile/events" },
            { text: "регионы", link: "/regions" },
            { text: "контакты", link: "/contacts" },
            { text: "о нас", link: "/about" },
            { text: "на главную", link: "/" },
            (isCentralAdmin() || isRegionalAdmin()) && { text: "admin панель", link: "/admin" }
          ].map(({ text, link }) => (
            <Link key={text} to={link} style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    fontFamily: "Montserrat",
                    fontSize: "30px",
                  }} 
                />
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default MenuDrawer;