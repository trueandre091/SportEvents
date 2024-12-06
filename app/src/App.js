import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import MainLanding from './components/MainLanding';
import Header from './components/Header';
import EventSlider from './components/EventSlider';
import EventStats from './components/EventStats';
import EventList from './components/EventList';
import Footer from './components/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/Profile';
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

function SportEventsPage() {
  return (
    <>
      <Header />
      <EventSlider />
      <EventStats />
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
            <Route path="/" element={<MainLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/sportevents" element={<SportEventsPage />} />
            <Route path="/sportevents/events" element={
              <>
                <Header />
                <EventList />
                <EventStats />
                <Footer />
              </>
            } />
            <Route path="/sportevents/profile" element={<Profile />} />
          </Routes>
        </EventProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
