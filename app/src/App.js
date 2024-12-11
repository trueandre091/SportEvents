import React from "react";
import HomePage from './pages/HomePage';
import Events from './pages/Events';
import About from './pages/About';
import Contacts from './pages/Contacts';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter, useLocation, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './utils/pageTransition';

// Создаем компонент для анимированных роутов
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          } 
        />
        <Route 
          path="/events" 
          element={
            <PageTransition>
              <Events />
            </PageTransition>
          } 
        />
        <Route 
          path="/about" 
          element={
            <PageTransition>
              <About />
            </PageTransition>
          } 
        />
        <Route 
          path="/contacts" 
          element={
            <PageTransition>
              <Contacts />
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CssBaseline />
        <Box sx={{
          position: 'relative',
          minHeight: '100vh',
          backgroundSize: 'cover',
          fontFamily: 'Montserrat',
        }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#292929',
              zIndex: -1,
            }}
          />
          <AnimatedRoutes />
        </Box>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
