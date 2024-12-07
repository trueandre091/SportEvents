export const eventService = {
    async getCurrentEvents() {
        const formData = new FormData();
        formData.append('archieve', 'True');

        try {
            console.log('Отправка запроса к /api/fsp/events');
            console.log('FormData:', {
                archieve: formData.get('archieve')
            });

            const response = await fetch('/api/fsp/events', {
                method: 'POST',
                body: formData
            });

            console.log('Статус ответа:', response.status);
            console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.error('Ошибка при получении событий. Статус:', response.status);
                const errorText = await response.text();
                console.error('Текст ошибки:', errorText);
                throw new Error('Ошибка при получении событий');
            }

            const data = await response.json();
            console.log('Полученные данные:', data);
            return data;
        } catch (error) {
            console.error('Ошибка при получении событий:', error);
            console.error('Полный объект ошибки:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }
}; 