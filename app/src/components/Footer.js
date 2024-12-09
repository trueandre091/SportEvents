import React from "react";
import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        color: "black",
        padding: 2,
        textAlign: "center",
        borderRadius: "15px",
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ color: "black", fontFamily: "Montserrat" }}
      >
        &copy; 2024 Федерация спортивного программирования. Все права защищены.
      </Typography>
    </Box>
  );
}

export default Footer;
