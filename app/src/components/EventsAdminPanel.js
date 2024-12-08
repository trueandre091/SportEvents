import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './EventsAdminPanel.css';

const EventsAdminPanel = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [expandedEventId, setExpandedEventId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [subscribedEvents, setSubscribedEvents] = useState(new Set());
    const fileInputRef = React.useRef();

    const ALLOWED_FILE_TYPES = {
        // Документы
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        // Изображения
        'image/jpeg': '.jpg, .jpeg',
        'image/png': '.png',
        // Архивы
        'application/zip': '.zip',
        'application/x-rar-compressed': '.rar'
    };

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10 MB

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!authService.isAuthenticated()) {
                    navigate('/');
                    return;
                }

                const userProfile = await authService.getProfile();
                setUserData(userProfile);

                if (userProfile.role !== 'CENTRAL_ADMIN' && 
                    userProfile.role !== 'REGIONAL_ADMIN' && 
                    userProfile.role !== 'ADMIN') {
                    navigate('/');
                    return;
                }

                const formData = new FormData();
                formData.append('archive', 'false');

                const response = await fetch('/api/fsp/events', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': authService.getToken()
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка при получении событий');
                }

                let eventsData = await response.json();

                if (userProfile.role === 'REGIONAL_ADMIN') {
                    eventsData = eventsData.filter(event => event.region === userProfile.region);
                }

                setEvents(eventsData);
            } catch (error) {
                console.error('Ошибка:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleEdit = async (eventId) => {
        const eventToEdit = events.find(e => e.id === eventId);
        setEditingEvent(eventToEdit);
        setEditFormData({
            id: eventToEdit.id,
            sport: eventToEdit.sport || '',
            title: eventToEdit.title || '',
            description: eventToEdit.description || '',
            admin_description: eventToEdit.admin_description || '',
            participants: eventToEdit.participants || '',
            participants_num: eventToEdit.participants_num?.toString() || '',
            discipline: eventToEdit.discipline || '',
            region: eventToEdit.region || '',
            representative: eventToEdit.representative || '',
            place: eventToEdit.place || '',
            date_start: eventToEdit.date_start || '',
            date_end: eventToEdit.date_end || '',
            status: eventToEdit.status || ''
        });
        setSelectedFiles([]);
        setIsEditModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Проверяем тип файлов
            const invalidFiles = files.filter(file => !ALLOWED_FILE_TYPES[file.type]);
            if (invalidFiles.length > 0) {
                alert(`Следующие файлы имеют неподдерживаемый формат:\n${invalidFiles.map(f => f.name).join('\n')}\n\nРазрешенные форматы:\n${Object.values(ALLOWED_FILE_TYPES).join(', ')}`);
                return;
            }

            // Проверяем размер каждого файла
            const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
            if (oversizedFiles.length > 0) {
                alert(`Следующие файлы превышают ${MAX_FILE_SIZE / (1024 * 1024)} MB:\n${oversizedFiles.map(f => f.name).join('\n')}`);
                return;
            }

            // Проверяем общий размер с уже выбранными файлами
            const totalSize = [...selectedFiles, ...files].reduce((acc, file) => acc + file.size, 0);
            if (totalSize > MAX_TOTAL_SIZE) {
                alert(`Общий размер файлов превышает ${MAX_TOTAL_SIZE / (1024 * 1024)} MB`);
                return;
            }
            
            setSelectedFiles(prevFiles => [...prevFiles, ...files]);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            
            // Добавляем все поля в FormData, кроме files
            Object.entries(editFormData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && key !== 'files') {
                    formData.append(key, value.toString());
                }
            });

            // Подготавливаем список текущих файлов
            const currentFiles = editingEvent?.files || [];
            
            // Оставляем только те файлы, которые не были удалены
            const filesToKeep = currentFiles.filter(file => 
                !selectedFiles.some(newFile => newFile.name === file.name)
            );

            // Преобразуем в формат, ожидаемый сервером
            const filesList = filesToKeep.map(file => ({
                name: file.name,
                path: file.path,
                size: file.size,
                type: file.type
            }));

            // Всегда добавляем список файлов как JSON строку, даже если он пустой
            formData.append('files', JSON.stringify(filesList || []));

            // Добавляем новые файлы, если они есть
            if (selectedFiles.length > 0) {
                selectedFiles.forEach((file) => {
                    formData.append('files', file);
                });
            }

            // Подробное логирование
            console.log('=== Отправляемые данные ===');
            console.log('EditFormData:', editFormData);
            console.log('Текущие файлы:', currentFiles);
            console.log('Файлы для сохранения:', filesList);
            console.log('Новые файлы:', selectedFiles);
            
            // Логируем содержимое FormData
            console.log('=== FormData содержимое ===');
            for (let pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    console.log(pair[0], 'File:', pair[1].name, pair[1].size);
                } else {
                    console.log(pair[0], pair[1]);
                }
            }

            const response = await fetch('/api/fsp/events/update', {
                method: 'POST',
                headers: {
                    'Authorization': authService.getToken()
                },
                body: formData
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                console.error('Ответ сервера:', responseData);
                throw new Error(responseData.message || 'Ошибка при обновлении события');
            }

            setEvents(events.map(event => 
                event.id === responseData.id ? responseData : event
            ));

            alert('Событие успе��но обновлено!');
            setIsEditModalOpen(false);
            setEditingEvent(null);
            setEditFormData({});
            setSelectedFiles([]);
        } catch (error) {
            console.error('Подробная ошибка:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleDelete = async (eventId) => {
        // TODO: Implement delete functionality
        console.log('Delete event:', eventId);
    };

    const toggleExpand = (eventId) => {
        setExpandedEventId(expandedEventId === eventId ? null : eventId);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderEditModal = () => {
        if (!isEditModalOpen || !editingEvent) return null;

        return (
            <div className="admin-events-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                <div className="admin-events-modal" onClick={e => e.stopPropagation()}>
                    <div className="admin-events-modal-header">
                        <h2>Редактирование события</h2>
                        <button 
                            className="admin-events-modal-close"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="admin-events-edit-form">
                        <div className="admin-events-form-grid">
                            <div className="admin-events-form-group">
                                <label>Название события</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Вид спорта</label>
                                <input
                                    type="text"
                                    name="sport"
                                    value={editFormData.sport}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Дисциплина</label>
                                <input
                                    type="text"
                                    name="discipline"
                                    value={editFormData.discipline}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Регион</label>
                                <input
                                    type="text"
                                    name="region"
                                    value={editFormData.region}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Место проведения</label>
                                <input
                                    type="text"
                                    name="place"
                                    value={editFormData.place}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Дата начала</label>
                                <input
                                    type="date"
                                    name="date_start"
                                    value={editFormData.date_start}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Дата окончания</label>
                                <input
                                    type="date"
                                    name="date_end"
                                    value={editFormData.date_end}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Количество участников</label>
                                <input
                                    type="number"
                                    name="participants_num"
                                    value={editFormData.participants_num}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Требования к участникам</label>
                                <input
                                    type="text"
                                    name="participants"
                                    value={editFormData.participants}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Представитель</label>
                                <input
                                    type="text"
                                    name="representative"
                                    value={editFormData.representative}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-events-form-group">
                                <label>Статус</label>
                                <select
                                    name="status"
                                    value={editFormData.status}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="approved">Одобрено</option>
                                    <option value="pending">В ожидании</option>
                                    <option value="rejected">Отклонено</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-events-form-group full-width">
                            <label>Описание</label>
                            <textarea
                                name="description"
                                value={editFormData.description}
                                onChange={handleEditInputChange}
                                required
                            />
                        </div>
                        <div className="admin-events-form-group full-width">
                            <label>Примечания администратора</label>
                            <textarea
                                name="admin_description"
                                value={editFormData.admin_description}
                                onChange={handleEditInputChange}
                                required
                            />
                        </div>
                        {renderFileUploadSection()}
                        <div className="admin-events-form-actions">
                            <button type="submit" className="admin-events-save-button">
                                Сохранить изменения
                            </button>
                            <button 
                                type="button" 
                                className="admin-events-cancel-button"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderFileUploadSection = () => {
        return (
            <div className="admin-events-form-group full-width">
                <label>Файлы</label>
                <div className="admin-events-files-upload">
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="admin-events-file-input"
                        accept={Object.values(ALLOWED_FILE_TYPES).join(',')}
                    />
                    <button
                        type="button"
                        className="admin-events-file-button"
                        onClick={() => fileInputRef.current.click()}
                    >
                        Выбрать файлы
                    </button>
                    <div className="admin-events-file-info">
                        Разрешенные форматы: PDF, DOC(X), XLS(X), JPG, PNG, ZIP, RAR<br />
                        Максимальный размер файла: 5 MB<br />
                        Общий размер файлов: до 10 MB
                    </div>
                </div>
                {selectedFiles.length > 0 && (
                    <div className="admin-events-selected-files">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="admin-events-file-item">
                                <span className="admin-events-file-icon">
                                    {file.type.includes('image') ? '🖼️' : 
                                     file.type.includes('pdf') ? '📄' :
                                     file.type.includes('word') ? '📝' :
                                     file.type.includes('sheet') ? '📊' :
                                     file.type.includes('zip') || file.type.includes('rar') ? '📦' : '📎'}
                                </span>
                                <span className="admin-events-file-name" title={file.name}>
                                    {file.name}
                                </span>
                                <span className="admin-events-file-size">
                                    {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <button
                                    type="button"
                                    className="admin-events-file-remove"
                                    onClick={() => removeFile(index)}
                                    title="Удалить файл"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <div className="admin-events-files-total">
                            Всего: {selectedFiles.length} файл(ов) / {(selectedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Добавляем функцию для проверки подписки
    const isSubscribed = (eventId) => {
        return subscribedEvents.has(eventId);
    };

    // Функция для подписки/отписки
    const handleSubscription = async (eventId, e) => {
        e.stopPropagation(); // Предотвращаем всплытие события
        try {
            const isCurrentlySubscribed = subscribedEvents.has(eventId);
            const endpoint = isCurrentlySubscribed ? '/api/fsp/events/unsubscribe' : '/api/fsp/events/subscribe';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authService.getToken()
                },
                body: JSON.stringify({ event_id: eventId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при изменении подписки');
            }

            // Обновляем состояние подписок
            setSubscribedEvents(prev => {
                const newSubscriptions = new Set([...prev]);
                if (isCurrentlySubscribed) {
                    newSubscriptions.delete(eventId);
                    console.log('Отписались от:', eventId);
                } else {
                    newSubscriptions.add(eventId);
                    console.log('Подписались на:', eventId);
                }
                console.log('Новый список подписок:', [...newSubscriptions]);
                return newSubscriptions;
            });

            // Показываем уведомление
            alert(isCurrentlySubscribed ? 'Вы отписались от события' : 'Вы подписались на событие');

        } catch (error) {
            console.error('Ошибка при изменении подписки:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Загружаем список подписок при монтировании компонента
    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await fetch('/api/fsp/events/subscriptions', {
                    method: 'GET',
                    headers: {
                        'Authorization': authService.getToken()
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка при получении списка подписок');
                }

                const data = await response.json();
                console.log('Загруженные подписки:', data);
                const eventIds = new Set(data.map(sub => sub.event_id));
                console.log('ID подписанных событий:', [...eventIds]);
                setSubscribedEvents(eventIds);
            } catch (error) {
                console.error('Ошибка при загрузке подписок:', error);
            }
        };

        if (authService.isAuthenticated()) {
            fetchSubscriptions();
        }
    }, []);

    if (loading) {
        return <div className="admin-events-loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="admin-events-error">{error}</div>;
    }

    return (
        <div className="admin-events-panel">
            <div className="admin-events-header">
                <h1>Здравствуйте, {userData?.name}!</h1>
                <button 
                    className="back-to-admin"
                    onClick={() => navigate('/profile/admin')}
                >
                    Вернуться в админ-панель
                </button>
            </div>

            <div className="admin-events-list">
                {events.map(event => (
                    <div key={event.id} className="admin-events-item">
                        <div 
                            className="admin-events-item-header" 
                            onClick={() => toggleExpand(event.id)}
                        >
                            <div className="admin-events-item-title">
                                <h2>{event.title}</h2>
                                <div className="admin-events-item-badges">
                                    <span className="admin-events-badge sport">{event.sport}</span>
                                    <span className={`admin-events-badge status ${event.status.toLowerCase()}`}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                            <div className="admin-events-item-actions">
                                <button
                                    className={`admin-events-subscribe-button ${subscribedEvents.has(event.id) ? 'subscribed' : ''}`}
                                    onClick={(e) => handleSubscription(event.id, e)}
                                >
                                    {subscribedEvents.has(event.id) ? 'Отписаться' : 'Подписаться'}
                                </button>
                                <span className={`admin-events-expand-icon ${expandedEventId === event.id ? 'expanded' : ''}`}>
                                    ▼
                                </span>
                            </div>
                        </div>

                        {expandedEventId === event.id && (
                            <div className="admin-events-item-details">
                                <div className="admin-events-detail-grid">
                                    <div className="admin-events-detail-section">
                                        <h3>Основная информация</h3>
                                        <p><strong>Вид спорта:</strong> {event.sport}</p>
                                        <p><strong>Дисциплина:</strong> {event.discipline}</p>
                                        <p><strong>Регион:</strong> {event.region}</p>
                                        <p><strong>Место проведения:</strong> {event.place}</p>
                                    </div>

                                    <div className="admin-events-detail-section">
                                        <h3>Даты проведения</h3>
                                        <p><strong>Начало:</strong> {formatDate(event.date_start)}</p>
                                        <p><strong>Окончание:</strong> {formatDate(event.date_end)}</p>
                                    </div>

                                    <div className="admin-events-detail-section">
                                        <h3>Участники</h3>
                                        <p><strong>Количество:</strong> {event.participants_num}</p>
                                        <p><strong>Требования:</strong> {event.participants}</p>
                                    </div>

                                    <div className="admin-events-detail-section">
                                        <h3>Организация</h3>
                                        <p><strong>Представитель:</strong> {event.representative}</p>
                                        <p><strong>Статус:</strong> {event.status}</p>
                                    </div>
                                </div>

                                <div className="admin-events-description">
                                    <h3>Описание</h3>
                                    <p>{event.description}</p>
                                </div>

                                {event.admin_description && (
                                    <div className="admin-events-admin-notes">
                                        <h3>Примечания администратора</h3>
                                        <p>{event.admin_description}</p>
                                    </div>
                                )}

                                {event.files && event.files.length > 0 && (
                                    <div className="admin-events-files">
                                        <h3>Прикрепленные файлы</h3>
                                        <div className="admin-events-files-list">
                                            {event.files.map((file, index) => (
                                                <a key={index} href={file.url} className="admin-events-file-link">
                                                    {file.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="admin-events-actions">
                                    <button 
                                        className="admin-events-edit-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(event.id);
                                        }}
                                    >
                                        Изменить
                                    </button>
                                    <button 
                                        className="admin-events-delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(event.id);
                                        }}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {renderEditModal()}
        </div>
    );
};

export default EventsAdminPanel; 