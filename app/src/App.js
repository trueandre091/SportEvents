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
  return <EventSlider />;
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
              <Route exact path="/" element={<MainPage />} />
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
