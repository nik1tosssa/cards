/**
 * timer.js - Управление таймером игры
 */

const GameTimer = {
    timerInterval: null,
    startTime: 0,
    elapsedTime: 0,

    /**
     * Форматирует миллисекунды в строку mm:ss
     */
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(minutes)}:${pad(seconds)}`;
    },

    /**
     * Запускает таймер
     */
    start(timerElement) {
        this.stop();
        this.startTime = Date.now();
        this.elapsedTime = 0;
        timerElement.textContent = '00:00';

        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            timerElement.textContent = this.formatTime(this.elapsedTime);
        }, 1000);
    },

    /**
     * Останавливает таймер
     */
    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.elapsedTime = Date.now() - this.startTime;
        }
    },

    /**
     * Сбрасывает таймер
     */
    reset(timerElement) {
        this.stop();
        this.elapsedTime = 0;
        timerElement.textContent = '00:00';
    },

    /**
     * Получает прошедшее время
     */
    getElapsedTime() {
        return this.elapsedTime;
    },
};
