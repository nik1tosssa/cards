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

                // Валидируем структуру JSON
                const validation = this.validateGameData(loadedData);
                if (!validation.valid) {
                    console.error('Ошибка валидации:', validation.error);
                    UIManager.showLoadingMessage(`Ошибка: ${validation.error}`, 4000);
                    event.target.value = '';
                    return;
                }

                // Запуск игры с загруженными данными
                GameController.startGame(loadedData);
                UIManager.showLoadingMessage('', 0); // Скрыть сообщение

            } catch (error) {
                console.error('Ошибка парсинга JSON:', error);
                UIManager.showLoadingMessage(`Ошибка парсинга JSON: ${error.message}`, 4000);
                event.target.value = '';
            }
        };

        reader.onerror = () => {
            console.error('Ошибка чтения файла');
            UIManager.showLoadingMessage('Ошибка: Не удалось прочитать файл.', 3000);
            event.target.value = '';
        };

        UIManager.showLoadingMessage('Загрузка данных из файла...', 0);
        reader.readAsText(file);
    },

    /**
     * Валидирует всю структуру данных игры (метаданные + карточки)
     */
    validateGameData(data) {
        // Проверяем, что это объект с требуемыми полями
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'JSON должен быть объектом с метаданными и карточками' };
        }

        // Проверяем метаданные игры
        if (!data.meta || typeof data.meta !== 'object') {
            return { valid: false, error: 'JSON должен содержать поле "meta" с метаданными' };
        }

        const meta = data.meta;

        // meta.title опциональное, но если указано - должно быть строкой
        if (meta.title !== undefined && typeof meta.title !== 'string') {
            return { valid: false, error: 'meta.title должен быть строкой (название игры)' };
        }

        // meta.columnNames опциональное, но если указано - должно быть массивом из 2 элементов
        if (meta.columnNames !== undefined) {
            if (!Array.isArray(meta.columnNames) || meta.columnNames.length !== 2) {
                return { valid: false, error: 'meta.columnNames должен быть массивом из 2 строк (названия колонок)' };
            }
        }

        // Опциональные метаданные
        if (meta.timeLimit !== undefined && (typeof meta.timeLimit !== 'number' || meta.timeLimit < 0)) {
            return { valid: false, error: 'meta.timeLimit должен быть неотрицательным числом (секунды). 0 = нет ограничения' };
        }

        if (meta.maxErrors !== undefined && (typeof meta.maxErrors !== 'number' || meta.maxErrors < 0)) {
            return { valid: false, error: 'meta.maxErrors должен быть неотрицательным числом. 0 = нет штрафа' };
        }

        // Проверяем карточки
        if (!data.cards || !Array.isArray(data.cards)) {
            return { valid: false, error: 'JSON должен содержать поле "cards" с массивом карточек' };
        }

        if (data.cards.length === 0 || data.cards.length % 2 !== 0) {
            return { valid: false, error: 'Массив карточек должен быть непустым и четной длины' };
        }

        // Проверяем структуру каждой карточки
        for (let i = 0; i < data.cards.length; i++) {
            const card = data.cards[i];
            
            // Проверяем, что карточка — это объект
            if (!card || typeof card !== 'object') {
                return { valid: false, error: `Карточка с индексом ${i} не является объектом` };
            }
            
            // Проверяем обязательные поля
            if (card.id === undefined || card.id === null) {
                return { valid: false, error: `Карточка с индексом ${i}: отсутствует поле 'id'` };
            }
            if (!card.type) {
                return { valid: false, error: `Карточка с индексом ${i}: отсутствует поле 'type'` };
            }
            if (!card.content) {
                return { valid: false, error: `Карточка с индексом ${i}: отсутствует поле 'content'` };
            }
            if (card.matchId === undefined || card.matchId === null) {
                return { valid: false, error: `Карточка с индексом ${i}: отсутствует поле 'matchId'` };
            }
        }

        return { valid: true };
    },

    /**
     * Валидирует структуру данных карточек (для обратной совместимости)
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
