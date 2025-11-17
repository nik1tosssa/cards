/**
 * gameUI.js - Управление UI интерфейсом и модальным окном
 */

const UIManager = {
    // Кэшируем DOM элементы
    scoreElement: null,
    totalPairsElement: null,
    errorCountElement: null,
    maxErrorsElement: null,
    timerElement: null,
    gridElement: null,
    loadingMessageElement: null,
    statusMessageModal: null,
    statusIcon: null,
    iconPath: null,
    statusTitle: null,
    statusText: null,
    restartButtonModal: null,

    /**
     * Инициализирует ссылки на DOM элементы
     */
    init() {
        this.scoreElement = document.getElementById('score');
        this.totalPairsElement = document.getElementById('total-pairs');
        this.errorCountElement = document.getElementById('error-count');
        this.maxErrorsElement = document.getElementById('max-errors');
        this.timerElement = document.getElementById('timer');
        this.gridElement = document.getElementById('game-grid');
        this.loadingMessageElement = document.getElementById('loading-message');
        this.statusMessageModal = document.getElementById('status-message-modal');
        this.statusIcon = document.getElementById('status-icon');
        this.iconPath = document.getElementById('icon-path');
        this.statusTitle = document.getElementById('status-title');
        this.statusText = document.getElementById('status-text');
        this.restartButtonModal = document.getElementById('restart-button-modal');
    },

    /**
     * Обновляет счет совпадений
     */
    updateScore(matched, total) {
        this.scoreElement.textContent = matched;
        this.totalPairsElement.textContent = total;
    },

    /**
     * Обновляет счетчик ошибок
     */
    updateErrorCount(errorCount) {
        this.errorCountElement.textContent = errorCount;
    },

    /**
     * Обновляет максимальное количество ошибок и показывает/скрывает счётчик
     */
    updateMaxErrors(maxErrors) {
        const errorCountContainer = document.querySelector('.text-red-600');
        if (maxErrors === Infinity) {
            // Нет штрафов - скрываем счётчик ошибок
            if (errorCountContainer) {
                errorCountContainer.style.display = 'none';
            }
        } else {
            // Есть штрафы - показываем счётчик
            if (errorCountContainer) {
                errorCountContainer.style.display = 'block';
            }
            this.maxErrorsElement.textContent = maxErrors;
        }
    },

    /**
     * Показывает весь игровой UI после загрузки JSON и регистрирует обработчик времени
     */
    showGameUI() {
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            gameUI.style.display = 'block';
        }

        // Регистрируем обработчик события истечения времени
        document.addEventListener('timeExpired', () => {
            DragDropHandler.handleTimeExpired();
        });
    },

    /**
     * Скрывает весь игровой UI
     */
    hideGameUI() {
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            gameUI.style.display = 'none';
        }
    },

    /**
     * Сбрасывает UI к начальному состоянию
     */
    resetUI() {
        this.scoreElement.textContent = 0;
        this.errorCountElement.textContent = 0;
        this.maxErrorsElement.textContent = GameState.MAX_ERRORS;
        this.statusMessageModal.classList.add('hidden');
        this.loadingMessageElement.style.display = 'none';
        // Очищаем подписи колонок, они будут установлены после загрузки JSON
        const col1 = document.getElementById('col-name-1');
        const col2 = document.getElementById('col-name-2');
        if (col1) col1.textContent = '';
        if (col2) col2.textContent = '';
    },

    /**
     * Показывает сообщение о загрузке
     */
    showLoadingMessage(message, duration = 3000) {
        this.loadingMessageElement.textContent = message;
        this.loadingMessageElement.style.display = 'block';
        if (duration) {
            setTimeout(() => {
                this.loadingMessageElement.style.display = 'none';
            }, duration);
        }
    },

    /**
     * Показывает модальное окно статуса игры
     */
    showGameStatusModal(status) {
        const finalTime = GameTimer.formatTime(GameTimer.getElapsedTime());

        if (status === 'win') {
            this.statusTitle.textContent = '🏆 Поздравляем!';
            this.statusIcon.classList.remove('text-red-500');
            this.statusIcon.classList.add('text-green-500');
            this.restartButtonModal.classList.remove('bg-red-600', 'hover:bg-red-700');
            this.restartButtonModal.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white');

            this.iconPath.setAttribute('d', 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z');

            this.statusText.innerHTML = `
                Вы успешно сопоставили все <strong>${GameState.totalPairs}</strong> пары!
                <br><br>
                Ваше время: <strong>${finalTime}</strong>
                <br>
                Ошибок: <strong>${GameState.errorCount}</strong>
            `;
        } else if (status === 'game-over') {
            this.statusTitle.textContent = '❌ Игра окончена';
            this.statusIcon.classList.remove('text-green-500');
            this.statusIcon.classList.add('text-red-500');
            this.restartButtonModal.classList.remove('bg-green-600', 'hover:bg-green-700');
            this.restartButtonModal.classList.add('bg-red-600', 'hover:bg-red-700', 'text-white');

            this.iconPath.setAttribute('d', 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z');

            this.statusText.innerHTML = `
                Вы достигли лимита ошибок (<strong>${GameState.MAX_ERRORS}</strong>).
                <br><br>
                Время игры: <strong>${finalTime}</strong>
                <br><br>
                Нажмите кнопку ниже, чтобы начать заново.
            `;
            this.restartButtonModal.textContent = 'Начать заново';
        }

        this.statusMessageModal.classList.remove('hidden');
    },

    /**
     * Скрывает модальное окно
     */
    hideGameStatusModal() {
        this.statusMessageModal.classList.add('hidden');
    },
};
