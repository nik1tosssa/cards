/**
 * gameState.js - Управление состоянием игры
 */

const GameState = {
    // Стандартный набор данных
    DEFAULT_CARD_DATA: [
        { id: 1, type: 'concept', content: 'HTML', matchId: 2 },
        { id: 2, type: 'definition', content: 'Язык разметки для структуры веб-страницы.', matchId: 1 },
        { id: 3, type: 'concept', content: 'CSS', matchId: 4 },
        { id: 4, type: 'definition', content: 'Описывает внешний вид и стиль документа, написанного на HTML.', matchId: 3 },
        { id: 5, type: 'concept', content: 'JavaScript', matchId: 6 },
        { id: 6, type: 'definition', content: 'Язык программирования для добавления интерактивности на веб-страницы.', matchId: 5 },
        { id: 7, type: 'concept', content: 'Git', matchId: 8 },
        { id: 8, type: 'definition', content: 'Система контроля версий, отслеживающая изменения в коде.', matchId: 7 },
        { id: 9, type: 'concept', content: 'База данных', matchId: 10 },
        { id: 10, type: 'definition', content: 'Структурированное хранилище для организации и управления данными.', matchId: 9 },
        { id: 11, type: 'concept', content: 'API', matchId: 12 },
        { id: 12, type: 'definition', content: 'Программный интерфейс, позволяющий двум приложениям взаимодействовать друг с другом.', matchId: 11 },
    ],

    MAX_ERRORS: 5,

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
    },

    /**
     * Устанавливает данные карточек
     */
    setCardData(data) {
        this.currentCardData = data || this.DEFAULT_CARD_DATA;
        this.totalPairs = this.currentCardData.length / 2;
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
