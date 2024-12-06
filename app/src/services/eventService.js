export const eventService = {
    async getCurrentEvents() {
        const formData = new FormData();
        formData.append('archieve', 'False');

        try {
            const response = await fetch('/api/fsp/events', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении событий');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при получении событий:', error);
            throw error;
        }
    }
}; 