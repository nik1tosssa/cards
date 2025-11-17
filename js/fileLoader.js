/**
 * fileLoader.js - Загрузка файлов и обработка JSON
 */

const FileLoader = {
    /**
     * Обрабатывает загрузку файла JSON
     */
    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/json') {
            UIManager.showLoadingMessage('Ошибка: Выберите файл JSON.', 1500);
            event.target.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target.result);

                // Базовая проверка структуры данных
                if (!Array.isArray(loadedData) || loadedData.length === 0 || loadedData.length % 2 !== 0) {
                    UIManager.showLoadingMessage('Ошибка: JSON должен быть непустым массивом четной длины.', 3000);
                    return;
                }

                // Запуск игры с загруженными данными
                GameController.startGame(loadedData);
                UIManager.showLoadingMessage('', 0); // Скрыть сообщение

            } catch (error) {
                console.error('Ошибка парсинга JSON:', error);
                UIManager.showLoadingMessage('Ошибка: Не удалось прочитать или распарсить JSON-файл.', 3000);
            }
        };

        UIManager.showLoadingMessage('Загрузка данных из файла...', 0);
        reader.readAsText(file);
    },

    /**
     * Валидирует структуру данных карточек
     */
    validateCardData(data) {
        if (!Array.isArray(data)) {
            return { valid: false, error: 'Данные должны быть массивом' };
        }

        if (data.length === 0 || data.length % 2 !== 0) {
            return { valid: false, error: 'Массив должен быть четной длины' };
        }

        // Проверяем, что каждый элемент имеет необходимые поля
        for (let card of data) {
            if (!card.id || !card.type || !card.content || card.matchId === undefined) {
                return { valid: false, error: 'Каждая карточка должна иметь поля: id, type, content, matchId' };
            }
        }

        return { valid: true };
    },
};
