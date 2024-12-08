import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import MainLanding from './components/MainLanding';
import SportHeader from './components/sportevents/Header';
import EventSlider from './components/sportevents/EventSlider';
import EventStats from './components/sportevents/EventStats';
import EventList from './components/sportevents/EventList';
import Footer from './components/sportevents/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/Profile';
import Events from './components/Events';
import Regions from './components/Regions';
import Contacts from './components/Contacts';
import Antidoping from './components/Antidoping';
import { EventProvider } from './context/EventContext';
import FavoriteEvents from './components/FavoriteEvents';
import AdminPanel from './components/AdminPanel';
import EventsAdminPanel from './components/EventsAdminPanel';
import StatisticsAdminPanel from './components/StatisticsAdminPanel';
import './App.css';

const SportEventsPage = () => (
  <>
    <SportHeader />
    <EventSlider />
    <EventStats />
    <Footer />
  </>
);

const SportEventsListPage = () => (
  <>
    <SportHeader />
    <EventList />
    <EventStats />
    <Footer />
  </>
);

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
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/admin" element={<AdminPanel />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/antidoping" element={<Antidoping />} />
            <Route path="/sportevents" element={<SportEventsPage />} />
            <Route path="/sportevents/events" element={<SportEventsListPage />} />
            <Route path="/favorite-events" element={<FavoriteEvents />} />
            <Route path="/profile/admin/events" element={<EventsAdminPanel />} />
            <Route path="/profile/admin/statistics" element={<StatisticsAdminPanel />} />
            <Route path="/profile/admin/representatives" element={<AdminPanel />} />
          </Routes>
        </EventProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
