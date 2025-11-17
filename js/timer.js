/**
 * timer.js - Управление таймером игры
 */

const GameTimer = {
    timerInterval: null,
    startTime: 0,
    elapsedTime: 0,
    timeLimit: null,  // в секундах, null = без ограничения
    isExpired: false,

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
     * Устанавливает лимит времени (в секундах)
     */
    setTimeLimit(seconds) {
        this.timeLimit = seconds > 0 ? seconds : null;
        this.isExpired = false;
    },

    /**
     * Запускает таймер
     */
    start(timerElement) {
        this.stop();
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.isExpired = false;
        timerElement.textContent = '00:00';

        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            timerElement.textContent = this.formatTime(this.elapsedTime);

            // Проверяем, истекло ли время
            if (this.timeLimit && this.elapsedTime >= this.timeLimit * 1000) {
                this.isExpired = true;
                this.stop();
                timerElement.textContent = '00:00';
                // Срабатывает событие окончания времени (обработка в dragDropHandler или gameUI)
                document.dispatchEvent(new CustomEvent('timeExpired'));
            }
        }, 100);
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
        this.isExpired = false;
        this.timeLimit = null;
        timerElement.textContent = '00:00';
    },

    /**
     * Получает прошедшее время
     */
    getElapsedTime() {
        return this.elapsedTime;
    },

    /**
     * Проверяет, истекло ли время
     */
    hasExpired() {
        return this.isExpired;
    },
};
