/**
 * game.js - Главный контроллер игры
 */

const GameController = {
    /**
     * Запускает или перезапускает игру
     */
    startGame(data) {
        // Сбрасываем состояние
        GameState.reset();
        UIManager.resetUI();
        GameTimer.reset(UIManager.timerElement);

        // Если данные не переданы, но есть сохраненные исходные данные - используем их (рестарт)
        if (!data && GameState.originalGameData) {
            data = GameState.originalGameData;
        }

        // Проверяем формат данных: новая модель (с meta) или старая (массив карточек)
        let isNewFormat = data && typeof data === 'object' && !Array.isArray(data) && data.meta && data.cards;

        if (isNewFormat) {
            // Новая модель с метаданными
            GameState.setGameData(data);
        } else if (data && Array.isArray(data) && data.length > 0) {
            // Старая модель - просто массив карточек
            GameState.setCardData(data);
        } else {
            // Нет данных — требуем загрузить JSON с игрой
            UIManager.hideGameUI();
            UIManager.showLoadingMessage('Нет загруженной игры. Пожалуйста, загрузите JSON с карточками через поле "Загрузить свой JSON".', 0);
            return;
        }

        // Показываем игровой UI после успешной загрузки данных
        UIManager.showGameUI();

        // Инициализируем состояние
        GameState.init();

        // Обновляем UI
        UIManager.updateScore(0, GameState.totalPairs);
        UIManager.updateErrorCount(0);
        UIManager.updateMaxErrors(GameState.MAX_ERRORS);

        // Обновляем заголовок и описание страницы, если указаны в метаданных
        const h1 = document.querySelector('h1');
        const description = document.getElementById('game-description');
        
        if (h1 && GameState.gameMeta.title) {
            h1.textContent = GameState.gameMeta.title;
        }
        
        if (description) {
            if (GameState.gameMeta.description) {
                description.textContent = GameState.gameMeta.description;
            } else {
                description.textContent = 'Перетащите карточки слева на карточки справа для сопоставления.';
            }
        }

        // Устанавливаем подписи колонок
        const col1 = document.getElementById('col-name-1');
        const col2 = document.getElementById('col-name-2');
        if (col1 && col2) {
            // Если метаданные содержат названия колонок, используем их
            if (GameState.gameMeta.columnNames && GameState.gameMeta.columnNames.length >= 2) {
                col1.textContent = GameState.gameMeta.columnNames[0];
                col2.textContent = GameState.gameMeta.columnNames[1];
            } else {
                // Иначе определяем по типам карточек
                const types = Array.from(new Set(GameState.currentCardData.map(c => c.type)));
                if (types.includes('concept') && types.includes('definition')) {
                    col1.textContent = 'Концепции';
                    col2.textContent = 'Определения';
                } else if (types.length >= 2) {
                    col1.textContent = types[0];
                    col2.textContent = types[1];
                } else if (types.length === 1) {
                    col1.textContent = types[0];
                    col2.textContent = '';
                } else {
                    col1.textContent = '';
                    col2.textContent = '';
                }
            }
        }

        // Рендерим карточки
        CardManager.renderCards(UIManager.gridElement, GameState.currentCardData, GameState.totalPairs);

        // Устанавливаем лимит времени, если указан в метаданных
        if (GameState.gameMeta.timeLimit) {
            GameTimer.setTimeLimit(GameState.gameMeta.timeLimit);
        }

        // Запускаем таймер
        GameTimer.start(UIManager.timerElement);
    },

    /**
     * Инициализирует игру при загрузке страницы
     */
    init() {
        // Инициализируем UI Manager
        UIManager.init();

        // Получаем DOM элементы для обработчиков событий
        const restartButton = document.getElementById('restart-button');
        const fileInputElement = document.getElementById('json-file');
        const restartButtonModal = document.getElementById('restart-button-modal');

        // Привязываем обработчики событий
        restartButton.addEventListener('click', () => this.startGame());
        fileInputElement.addEventListener('change', (e) => FileLoader.handleFileLoad(e));
        restartButtonModal.addEventListener('click', () => this.startGame());

        // Не запускаем игру автоматически — ожидаем загрузки JSON с конкретной игрой.
    },
};

// Инициализируем игру при загрузке страницы
window.addEventListener('load', () => GameController.init());
