import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { createEvent, updateEvent } from '../api/event';
import { getRegions } from '../api/user';
import { useAuth } from '../context/AuthContext';
import { v4 as uuid } from 'uuid';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto',
  borderRadius: 2
};

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#333',
    },
    '&:hover fieldset': {
      borderColor: '#666',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.7)',
    fontFamily: 'Montserrat'
  },
  '& .MuiOutlinedInput-input': {
    color: 'rgba(0, 0, 0, 0.9)',
    fontFamily: 'Montserrat'
  },
  '& .MuiSelect-select': {
    fontFamily: 'Montserrat'
  },
  '& .MuiMenuItem-root': {
    fontFamily: 'Montserrat'
  }
};

const buttonStyle = {
  backgroundColor: '#1976d2',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1565c0',
  }
};

const EventModal = ({ open, handleClose, onEventCreated, editMode = false, eventToEdit = null }) => {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'ADMIN' || userData?.role === 'CENTRAL_ADMIN';
  const isRegionalAdmin = userData?.role === 'REGIONAL_ADMIN';

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    admin_description: '',
    participants: '',
    participants_num: '',
    discipline: '',
    region: '',
    place: '',
    date_start: '',
    date_end: '',
    files: [],
    status: '',
    representative: null
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

  useEffect(() => {
    if (editMode && eventToEdit) {
      // Преобразуем даты из формата "DD.MM.YYYY HH:mm" в "YYYY-MM-DD"
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [datePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('.');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      // Извлекаем только число из строки participants_num
      const formatParticipantsNum = (value) => {
        if (!value) return '';
        const number = parseInt(value.toString().replace(/[^\d]/g, ''));
        return isNaN(number) ? '' : number.toString();
      };

      setEventData({
        ...eventToEdit,
        date_start: formatDate(eventToEdit.date_start),
        date_end: formatDate(eventToEdit.date_end),
        participants_num: formatParticipantsNum(eventToEdit.participants_num),
        files: eventToEdit.files || []
      });
    } else if (userData?.role === 'REGIONAL_ADMIN') {
      // Для регионального админа устанавливаем его регион по умолчанию
      setEventData(prev => ({
        ...prev,
        region: userData.region
      }));
    }
  }, [editMode, eventToEdit, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setEventData(prev => ({
      ...prev,
      files: [...(prev.files || []), ...files]
    }));
  };

  const handleRemoveFile = (indexToRemove) => {
    setEventData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }));
  };

  const formatFileSize = (size) => {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
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

    // Преобразуем строки дат в объекты Date
    const startDate = new Date(eventData.date_start);
    const endDate = new Date(eventData.date_end);
    const now = new Date();

    // Сбрасываем время для корректного сравнения дат
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError('Неверный формат дат');
      return false;
    }

    if (startDate > endDate) {
      setError('Дата начала не может быть позже даты окончания');
      return false;
    }

    if (startDate < now) {
      setError('Дата начала не может быть в прошлом');
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
      const response = editMode
        ? await updateEvent(eventData)
        : await createEvent(eventData);
      
      if (response.ok) {
        console.log(editMode ? 'Событие обновлено:' : 'Событие создано:', response.data);
        if (onEventCreated) {
          onEventCreated();
        }
        handleClose();
        window.location.reload();
      } else {
        setError(response.error || `Ошибка при ${editMode ? 'обновлении' : 'создании'} события`);
      }
    } catch (error) {
      console.error(`Ошибка при ${editMode ? 'обновлении' : 'создании'} события:`, error);
      setError(error.message || `Ошибка при ${editMode ? 'обновлении' : 'создании'} события`);
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
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500'
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2" sx={{ mb: 4 }}>
          {editMode ? 'Редактирование события' : 'Создание нового события'}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
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
              onChange={(e) => {
                const value = e.target.value;
                // Проверяем, что значение является положительным числом
                if (!value || (parseInt(value) >= 0)) {
                  handleChange(e);
                }
              }}
              inputProps={{ min: 0 }}
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
            <FormControl fullWidth sx={inputStyle}>
              <InputLabel>Регион</InputLabel>
              <Select
                value={eventData.region}
                name="region"
                onChange={handleChange}
                label="Регион"
                disabled={isRegionalAdmin || !isAdmin}
              >
                {regions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                variant="contained"
                component="span"
                sx={buttonStyle}
              >
                Загрузить файлы
              </Button>
            </label>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {eventData.files?.map((file, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    padding: 1
                  }}
                >
                  <Typography variant="body2">{file.name}</Typography>
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'background.paper'
                    }}
                    onClick={() => {
                      setEventData(prev => ({
                        ...prev,
                        files: prev.files.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>

          {isAdmin && editMode && (
            <>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={inputStyle}>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={eventData.status}
                    name="status"
                    onChange={handleChange}
                    label="Статус"
                  >
                    <MenuItem value="CONSIDERATION">На рассмотрении</MenuItem>
                    <MenuItem value="APPROVED">Одобрено</MenuItem>
                    <MenuItem value="REJECTED">Отклонено</MenuItem>
                  </Select>
                </FormControl>
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
            </>
          )}

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
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : editMode ? (
                'Сохранить изменения'
              ) : (
                'Создать событие'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default EventModal;