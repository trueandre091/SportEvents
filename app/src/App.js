import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import EventSlider from './components/EventSlider';
import EventList from './components/EventList';
import Footer from './components/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { EventProvider } from './context/EventContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007bff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

function MainPage() {
  return (
    <>
      <Header />
      <EventSlider />
      <Footer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <EventProvider>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/events" element={
              <>
                <Header />
                <EventList />
                <Footer />
              </>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </EventProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
