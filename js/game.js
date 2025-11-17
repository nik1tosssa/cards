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

        // Устанавливаем данные карточек только при явной передаче массива.
        if (data && Array.isArray(data) && data.length > 0) {
            GameState.setCardData(data);
        } else if (GameState.currentCardData && GameState.currentCardData.length > 0) {
            // Если данные уже были загружены ранее - используем их (перезапуск/рестарт).
            // GameState.currentCardData уже установлены
            GameState.totalPairs = GameState.currentCardData.length / 2;
        } else {
            // Нет данных — требуем загрузить JSON с игрой
            UIManager.showLoadingMessage('Нет загруженной игры. Пожалуйста, загрузите JSON с карточками через поле "Загрузить свой JSON".', 0);
            UIManager.gridElement.innerHTML = '';
            UIManager.gridElement.style.display = 'none';
            return;
        }

        // Инициализируем состояние
        GameState.init();

        // Обновляем UI
        UIManager.updateScore(0, GameState.totalPairs);
        UIManager.updateErrorCount(0);

        // Устанавливаем подписи колонок на основе типов карточек в наборе данных
        const col1 = document.getElementById('col-name-1');
        const col2 = document.getElementById('col-name-2');
        if (col1 && col2) {
            // Определяем уникальные типы и назначаем подписи
            const types = Array.from(new Set(GameState.currentCardData.map(c => c.type)));
            // Привычные подписи для сетов 'concept' и 'definition'
            if (types.includes('concept') && types.includes('definition')) {
                col1.textContent = 'Концепции';
                col2.textContent = 'Определения';
            } else if (types.length >= 2) {
                col1.textContent = types[0];
                col2.textContent = types[1];
            } else if (types.length === 1) {
                // Если только один тип — подпись оставляем на первой колонке, вторая пустая
                col1.textContent = types[0];
                col2.textContent = '';
            } else {
                col1.textContent = '';
                col2.textContent = '';
            }
        }

        // Рендерим карточки
        CardManager.renderCards(UIManager.gridElement, GameState.currentCardData, GameState.totalPairs);

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
