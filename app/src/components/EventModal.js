import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Input,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createEvent } from '../api/event';
import { getRegions } from '../api/user';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  bgcolor: '#1a1a1a',
  border: '2px solid #333',
  borderRadius: '20px',
  boxShadow: 24,
  p: 4,
  color: 'white',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: '#333',
    },
    '&:hover fieldset': {
      borderColor: '#666',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#888',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#888',
  },
  '& .MuiOutlinedInput-input': {
    color: 'white',
  },
  marginBottom: 2
};

const EventModal = ({ open, handleClose, onEventCreated }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    admin_description: '',
    participants: '',
    participants_num: '',
    discipline: '',
    region: '',
    representative: '',
    place: '',
    date_start: '',
    date_end: '',
    file: null
  });

  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      const response = await getRegions();
      if (response.ok) {
        setRegions(response.regions);
      } else {
        setError('Ошибка при загрузке списка регионов');
        console.error('Ошибка при загрузке регионов:', response.error);
      }
      setLoading(false);
    };

    if (open) {
      fetchRegions();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEventData(prev => ({
      ...prev,
      file: file
    }));
  };

  const validateForm = () => {
    if (!eventData.region) {
      setError('Необходимо выбрать регион');
      return false;
    }

    if (!eventData.date_start || !eventData.date_end) {
      setError('Необходимо указать даты начала и окончания');
      return false;
    }

    const startDate = new Date(eventData.date_start);
    const endDate = new Date(eventData.date_end);
    const now = new Date();

    // Сбрасываем время для корректного сравнения дат
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      setError('Дата начала не может быть позже даты окончания');
      return false;
    }

    if (startDate < now || endDate < now) {
      setError('Даты не могут быть в прошлом');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await createEvent(eventData);
      
      if (response.ok) {
        console.log('Событие успешно создано:', response.data);
        if (onEventCreated) {
          onEventCreated();
        }
        handleClose();
      } else {
        setError(response.error || 'Ошибка при создании события');
      }
    } catch (error) {
      console.error('Ошибка при создании события:', error);
      setError(error.message || 'Ошибка при создании события');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2" sx={{ mb: 4 }}>
          Создание нового события
        </Typography>

        {error && (
          <Typography 
            color="error" 
            sx={{ 
              mb: 2, 
              backgroundColor: 'rgba(255, 0, 0, 0.1)', 
              padding: 1, 
              borderRadius: 1 
            }}
          >
            {error}
          </Typography>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название события"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Описание"
              name="description"
              multiline
              rows={4}
              value={eventData.description}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Административное описание"
              name="admin_description"
              multiline
              rows={2}
              value={eventData.admin_description}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Участники"
              name="participants"
              value={eventData.participants}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Количество участников"
              name="participants_num"
              type="number"
              value={eventData.participants_num}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Дисциплина"
              name="discipline"
              value={eventData.discipline}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={inputStyle} required>
              <InputLabel sx={{ color: '#888' }}>Регион</InputLabel>
              <Select
                value={eventData.region}
                name="region"
                onChange={handleChange}
                label="Регион"
                disabled={loading}
              >
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  regions.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Представитель (ID)"
              name="representative"
              value={eventData.representative}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Место проведения"
              name="place"
              value={eventData.place}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Дата начала"
              name="date_start"
              type="date"
              value={eventData.date_start}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Дата окончания"
              name="date_end"
              type="date"
              value={eventData.date_end}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            <Input
              type="file"
              onChange={handleFileChange}
              sx={{
                color: 'white',
                '&::before': {
                  borderBottom: '1px solid #333'
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid #666'
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                mt: 2,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#115293'
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Создать событие'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default EventModal;