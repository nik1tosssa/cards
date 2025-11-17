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

        // Устанавливаем данные карточек
        GameState.setCardData(data);

        if (GameState.totalPairs === 0) {
            UIManager.showLoadingMessage('Нет данных для начала игры. Загрузите файл или используйте стандартный набор.');
            UIManager.gridElement.innerHTML = '';
            UIManager.gridElement.style.display = 'none';
            return;
        }

        // Инициализируем состояние
        GameState.init();

        // Обновляем UI
        UIManager.updateScore(0, GameState.totalPairs);
        UIManager.updateErrorCount(0);

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

        // Первый запуск игры
        this.startGame();
    },
};

// Инициализируем игру при загрузке страницы
window.addEventListener('load', () => GameController.init());
