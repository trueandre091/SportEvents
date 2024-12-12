import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, MenuItem } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiSelect-icon': {
    color: 'white',
  },
  '& .MuiMenuItem-root': {
    color: 'white',
  }
};

const EventModal = ({ open, onClose, onSubmit }) => {
  const [eventData, setEventData] = React.useState({
    id: '',
    sport: '',
    title: '',
    description: '',
    admin_description: '',
    participants: '',
    participants_num: '',
    discipline: '',
    region: '',
    representative: '',
    files: [],
    place: '',
    date_start: '',
    date_end: '',
    status: ''
  });

  const handleSubmit = () => {
    onSubmit(eventData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2e2e2e',
          borderRadius: '20px',
          color: 'white',
        }
      }}
    >
      <DialogTitle sx={{
        fontFamily: 'Montserrat',
        fontSize: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        Добавить событие
      </DialogTitle>
      <DialogContent sx={{ paddingTop: '20px' }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '& .MuiTextField-root': {
            marginBottom: '15px',
          },
          padding: '20px'
        }}>
          <TextField
            label="Название"
            value={eventData.title}
            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
            required
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Описание"
            value={eventData.description}
            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            required
            multiline
            rows={4}
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Комментарий от администратора"
            value={eventData.admin_description}
            onChange={(e) => setEventData({ ...eventData, admin_description: e.target.value })}
            required
            multiline
            rows={4}
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Участники"
            value={eventData.participants}
            onChange={(e) => setEventData({ ...eventData, participants: e.target.value })}
            required
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Количество участников"
            type="number"
            value={eventData.participants_num}
            onChange={(e) => setEventData({ ...eventData, participants_num: e.target.value })}
            required
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Дисциплина"
            value={eventData.discipline}
            onChange={(e) => setEventData({ ...eventData, discipline: e.target.value })}
            required
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Регион"
            value={eventData.region}
            onChange={(e) => setEventData({ ...eventData, region: e.target.value })}
            required
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Представитель"
            value={eventData.representative}
            onChange={(e) => setEventData({ ...eventData, representative: e.target.value })}
            required
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Место проведения"
            value={eventData.place}
            onChange={(e) => setEventData({ ...eventData, place: e.target.value })}
            required
            fullWidth
            sx={textFieldStyle}
          />
          <TextField
            label="Дата начала"
            type="datetime-local"
            value={eventData.date_start}
            onChange={(e) => setEventData({ ...eventData, date_start: e.target.value })}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={textFieldStyle}
          />
          <TextField
            label="Дата окончания"
            type="datetime-local"
            value={eventData.date_end}
            onChange={(e) => setEventData({ ...eventData, date_end: e.target.value })}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={textFieldStyle}
          />
          <TextField
            select
            label="Статус"
            value={eventData.status}
            onChange={(e) => setEventData({ ...eventData, status: e.target.value })}
            required
            fullWidth
            sx={textFieldStyle}
          >
            <MenuItem value="DRAFT">Черновик</MenuItem>
            <MenuItem value="PUBLISHED">Опубликовано</MenuItem>
            <MenuItem value="ARCHIVED">В архиве</MenuItem>
          </TextField>

          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: 'white'
              }
            }}
          >
            Загрузить файлы
            <input
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setEventData({ ...eventData, files: files });
              }}
            />
          </Button>
          {eventData.files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Выбранные файлы:
              </Typography>
              {eventData.files.map((file, index) => (
                <Typography key={index} variant="body2" sx={{ color: 'white' }}>
                  {file.name}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: '20px' }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#402fff',
            '&:hover': {
              backgroundColor: '#3029cc'
            }
          }}
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;