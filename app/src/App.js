import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import EventSlider from './components/EventSlider';
import EventList from './components/EventList';
import Footer from './components/Footer';
import { EventProvider } from './context/EventContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007bff',
    },
    background: {
      default: '#1a1a1a',
      paper: '#333333',
    },
  },
});

function MainPage() {
  return (
    <>
      <EventSlider />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EventProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/events" element={<EventList />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </EventProvider>
    </ThemeProvider>
  );
}

export default App;
