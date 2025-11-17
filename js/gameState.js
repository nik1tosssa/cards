/**
 * gameState.js - Управление состоянием игры
 */

const GameState = {
    MAX_ERRORS: 5,
    DEFAULT_TIME_LIMIT: null, // null = без ограничения по времени

    // Метаданные текущей игры
    gameMeta: {
        title: '',
        description: '',
        columnNames: ['Левая', 'Правая'],
        timeLimit: null,
        maxErrors: 5
    },

    // Исходные данные игры (для перезапуска)
    originalGameData: null,

    // Текущее состояние
    currentCardData: [],
    matchedPairs: 0,
    totalPairs: 0,
    draggedCardId: null,
    errorCount: 0,

    /**
     * Инициализирует состояние игры
     */
    init() {
        this.matchedPairs = 0;
        this.draggedCardId = null;
        this.errorCount = 0;
    },

    /**
     * Сбрасывает состояние к начальному
     */
    reset() {
        this.currentCardData = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.draggedCardId = null;
        this.errorCount = 0;
        this.gameMeta = {
            title: '',
            description: '',
            columnNames: ['Левая', 'Правая'],
            timeLimit: null,
            maxErrors: 5
        };
        // НЕ очищаем originalGameData — это нужно для рестарта игры
    },

    /**
     * Устанавливает метаданные и карточки из загруженных данных
     */
    setGameData(gameData) {
        // gameData имеет структуру: { meta: {...}, cards: [...] }
        if (gameData && gameData.meta && gameData.cards) {
            // Сохраняем исходные данные для возможности рестарта
            this.originalGameData = gameData;

            // Устанавливаем метаданные
            // 0 означает: нет ограничений/штрафов
            const maxErrors = gameData.meta.maxErrors !== undefined ? gameData.meta.maxErrors : 5;
            const timeLimit = gameData.meta.timeLimit !== undefined ? gameData.meta.timeLimit : null;

        this.gameMeta = {
            title: gameData.meta.title || 'Без названия',
            description: gameData.meta.description || '',
            columnNames: gameData.meta.columnNames || ['Левая', 'Правая'],
            timeLimit: timeLimit === 0 ? null : timeLimit,  // 0 = нет ограничения по времени
            maxErrors: maxErrors === 0 ? Infinity : maxErrors  // 0 = нет штрафа за ошибки
        };

            // Устанавливаем карточки
            if (Array.isArray(gameData.cards) && gameData.cards.length > 0) {
                this.currentCardData = gameData.cards;
                this.totalPairs = this.currentCardData.length / 2;
            } else {
                this.currentCardData = [];
                this.totalPairs = 0;
            }

            // Обновляем MAX_ERRORS в соответствии с метаданными
            this.MAX_ERRORS = this.gameMeta.maxErrors;
        } else {
            this.currentCardData = [];
            this.totalPairs = 0;
        }
    },

    /**
     * Устанавливает данные карточек (для обратной совместимости со старой моделью)
     */
    setCardData(data) {
        // Устанавливаем только если передан валидный массив, иначе очищаем данные.
        if (Array.isArray(data) && data.length > 0) {
            // Сохраняем исходные данные для возможности рестарта
            this.originalGameData = data;
            this.currentCardData = data;
            this.totalPairs = this.currentCardData.length / 2;
        } else {
            this.currentCardData = [];
            this.totalPairs = 0;
        }
    },

    /**
     * Увеличивает счетчик совпадений
     */
    incrementMatched() {
        this.matchedPairs++;
    },

    /**
     * Увеличивает счетчик ошибок
     */
    incrementErrors() {
        this.errorCount++;
    },

    /**
     * Проверяет, достигнут ли лимит ошибок
     */
    isMaxErrorsReached() {
        return this.errorCount >= this.MAX_ERRORS;
    },

    /**
     * Проверяет, все ли пары совпадены
     */
    isAllMatched() {
        return this.matchedPairs === this.totalPairs;
    },
};
