import React from "react";
import HomePage from './pages/HomePage';
import Events from './pages/Events';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Regions from './pages/Regions';
import Profile from './pages/Profile';
import ProfileEvents from './pages/ProfileEvents';
import AdminPanel from './pages/AdminPanel';
import AdminRegions from './pages/AdminRegions';
import AdminEvents from './pages/AdminEvents';
import AdminStats from './pages/AdminStats';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter, useLocation, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './utils/pageTransition';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Создаем компонент для анимированных роутов
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
        <Route
          path="/regions"
          element={
            <PageTransition>
              <Regions />
            </PageTransition>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <PrivateRoute>
              <PageTransition>
                <AdminStats />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <PrivateRoute>
              <PageTransition>
                <AdminEvents />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/regions"
          element={
            <PrivateRoute>
              <PageTransition>
                <AdminRegions />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <PageTransition>
                <AdminPanel />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/events"
          element={
            <PrivateRoute>
              <PageTransition>
                <ProfileEvents />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PageTransition>
                <Profile />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
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
          minWidth: '100vw',
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
