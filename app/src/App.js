import React from "react";
import HomePage from './pages/HomePage';
import Events from './pages/Events';
import About from './pages/About';
import Contacts from './pages/Contacts';
import { CssBaseline, Box} from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/events",
    element: <Events />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contacts",
    element: <Contacts />,
  },
]);


function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Box sx={{
        position: 'relative',
        minHeight: '100vh',
        backgroundSize: 'cover',
        fontFamily: 'Montserrat',
        overflow: 'hidden',
      }}>
        {/* Псевдоэлемент для фонового размытия */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(150deg, #ffffff 0%, #533ac2 20%, #1a1a1a 45%, #1a1a1a 50%, #a33e6d 80%, #d481a8 100%)',
            zIndex: -1,
          }}
        />
        <RouterProvider router={router} />
      </Box>
    </AuthProvider>
  );
}

export default App;
