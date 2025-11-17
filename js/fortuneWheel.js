/**
 * fortuneWheel.js - Колесо Фортуны (упрощённая версия)
 * 
 * Игрок загружает JSON со списком слов/фраз.
 * Колесо вращается и выбирает случайное слово.
 * Выбранное слово отображается в центре колеса.
 */

const FortuneWheelGame = {
    // Состояние игры
    gameData: [],
    selectedIndex: -1,
    isSpinning: false,
    wheelSegments: [],
    
    // DOM элементы
    wheelCanvas: null,
    spinButton: null,
    resultDisplay: null,
    statusModal: null,
    selectedWord: null,
    fileInput: null,

    /**
     * Инициализирует игру при загрузке страницы
     */
    init() {
        console.log('FortuneWheelGame: Инициализация');
        
        // Кэшируем DOM элементы
        this.wheelCanvas = document.getElementById('wheel-canvas');
        this.spinButton = document.getElementById('spin-button');
        this.resultDisplay = document.getElementById('result-display');
        this.statusModal = document.getElementById('status-modal');
        this.selectedWord = document.getElementById('selected-word');
        this.fileInput = document.getElementById('fortune-file');

        // Проверяем, что все обязательные элементы найдены
        const missingElements = [];
        if (!this.wheelCanvas) missingElements.push('wheel-canvas');
        if (!this.spinButton) missingElements.push('spin-button');
        if (!this.resultDisplay) missingElements.push('result-display');
        if (!this.statusModal) missingElements.push('status-modal');
        if (!this.selectedWord) missingElements.push('selected-word');
        if (!this.fileInput) missingElements.push('fortune-file');

        if (missingElements.length > 0) {
            console.error('FortuneWheelGame: Не найдены элементы:', missingElements.join(', '));
            alert(`Ошибка: Не найдены элементы: ${missingElements.join(', ')}\n\nПожалуйста, проверьте HTML.`);
            return;
        }

        // Привязываем обработчики событий
        if (this.spinButton) this.spinButton.addEventListener('click', () => this.spin());
        if (this.fileInput) this.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));

        // Инициализируем canvas для колеса
        this.initializeCanvas();

        console.log('FortuneWheelGame: Инициализация завершена');
    },

    /**
     * Инициализирует Canvas и рисует пустое колесо
     */
    initializeCanvas() {
        if (!this.wheelCanvas) return;
        
        const ctx = this.wheelCanvas.getContext('2d');
        if (!ctx) {
            console.error('Не удалось получить контекст Canvas');
            return;
        }

        const centerX = this.wheelCanvas.width / 2;
        const centerY = this.wheelCanvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Очищаем canvas
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, this.wheelCanvas.width, this.wheelCanvas.height);

        // Рисуем серый круг как заглушка
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Рисуем текст "Загрузите JSON"
        ctx.fillStyle = '#4b5563';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Загрузите JSON', centerX, centerY - 20);
        ctx.fillText('для начала игры', centerX, centerY + 20);
    },

    /**
     * Обработчик загрузки файла
     */
    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.loadGameData(data);
                event.target.value = ''; // Очищаем input
            } catch (error) {
                console.error('Ошибка при чтении JSON:', error.message);
                alert(`Ошибка при загрузке файла: ${error.message}`);
                event.target.value = '';
            }
        };
        reader.onerror = () => {
            console.error('Ошибка при чтении файла');
            alert('Не удалось прочитать файл');
            event.target.value = '';
        };
        reader.readAsText(file);
    },

    /**
     * Загружает и валидирует данные игры
     */
    // Преобразует входной JSON- массив в нормализованный массив {text, importance}
    normalizeInput(data) {
        if (!Array.isArray(data)) return [];
        const out = [];
        for (let item of data) {
            let text = '';
            let importance = 1;
            if (typeof item === 'string') {
                text = item.trim();
            } else if (item && typeof item === 'object') {
                if (item.text) text = String(item.text).trim();
                if (typeof item.importance === 'number' && isFinite(item.importance) && item.importance > 0) {
                    importance = item.importance;
                } else if (typeof item.weight === 'number' && isFinite(item.weight) && item.weight > 0) {
                    importance = item.weight;
                }
            }
            if (text) out.push({ text, importance });
        }
        return out;
    },

    loadGameData(data) {
        const normalized = this.normalizeInput(data);
        if (normalized.length === 0) {
            alert('Ошибка: JSON не содержит валидных слов/фраз');
            return;
        }
        // Сохраняем и инициализируем
        this.gameData = normalized;
        this.selectedIndex = -1;
        const gameUI = document.getElementById('game-ui');
        if (gameUI) gameUI.style.display = '';
        this.initializeWheel();
        this.spinButton.disabled = false;
        this.spinButton.textContent = '🎲 Вращать колесо';
        this.resultDisplay.textContent = `Загружено ${normalized.length} слов. Нажми "Вращать колесо"!`;
    },

    /**
     * Инициализирует колесо и рисует его со словами
     */
    initializeWheel() {
        console.log('FortuneWheelGame: Инициализация колеса');

        if (!this.wheelCanvas) return;

        // Перестроим сегменты (логика вынесена в buildSegments)
        this.buildSegments();

        // А затем отрисуем колесо на canvas через drawWheelRotated(0)
        this.drawWheelRotated(0);
    },

    /**
     * Построение массива wheelSegments на основе this.gameData (учитывает importance)
     */
    buildSegments() {
        this.wheelSegments = [];
        if (!this.gameData || this.gameData.length === 0) return;
        const totalWeight = this.gameData.reduce((s, it) => s + (it.importance || 1), 0);
        const fullCircle = Math.PI * 2;
        let angleCursor = -Math.PI / 2; // стартуем сверху
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#f97316', '#ef4444', '#14b8a6'];
        for (let i = 0; i < this.gameData.length; i++) {
            const item = this.gameData[i];
            const weight = item.importance || 1;
            const segAngle = (weight / totalWeight) * fullCircle;
            const startAngle = angleCursor;
            const endAngle = startAngle + segAngle;
            this.wheelSegments.push({ startAngle, endAngle, itemIndex: i, color: colors[i % colors.length] });
            angleCursor = endAngle;
        }
    },

    /**
     * Рисует стрелку-указатель на колесе
     */
    drawPointer(ctx, x, y) {
        const size = 15;
        ctx.fillStyle = '#ef4444';
    // Draw an inverted triangle so the pointer points down toward the wheel
    ctx.beginPath();
    ctx.moveTo(x, y + size);           // bottom apex (toward wheel)
    ctx.lineTo(x - size, y - size);    // left point above
    ctx.lineTo(x + size, y - size);    // right point above
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.stroke();
    },

    /**
     * Вращает колесо и выбирает случайное слово
     */
    spin() {
        if (this.isSpinning || this.gameData.length === 0) return;

        console.log('FortuneWheelGame: Начало вращения');

        this.isSpinning = true;
        this.spinButton.disabled = true;

        // Выбираем случайный сегмент
        const randomSegmentIndex = Math.floor(Math.random() * this.gameData.length);
        const targetSegment = this.wheelSegments[randomSegmentIndex];
        const targetAngle = (targetSegment.startAngle + targetSegment.endAngle) / 2;

        // Точка на колесе сверху, где указатель
        const pointerAngle = -Math.PI / 2;

        // Вычисляем, насколько нужно повернуть колесо
        let rotationDelta = pointerAngle - targetAngle;

        // Нормализуем угол
        while (rotationDelta < 0) {
            rotationDelta += Math.PI * 2;
        }

        // Добавляем несколько полных оборотов для эффекта
        const fullRotations = 5 + Math.random() * 3;
        const totalRotation = fullRotations * Math.PI * 2 + rotationDelta;

        // Анимируем вращение
        const startTime = Date.now();
        const duration = 2000; // 2 секунды

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Используем ease-out функцию для плавного замедления
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentRotation = totalRotation * easeProgress;

            // Перерисовываем колесо с ротацией
            this.drawWheelRotated(currentRotation);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Вращение закончилось
                this.isSpinning = false;
                this.spinButton.disabled = false;

                    // Вращение завершено — вычислим, какой сегмент реально оказался под указателем
                    const finalRotation = totalRotation; // итоговая абсолютная ротация, которая была отрисована
                    const resolvedIndex = this.getIndexForRotation(finalRotation);
                    // Сохраняем и показываем результат по вычисленному индексу
                    this.selectedIndex = resolvedIndex;
                    this.showResult(resolvedIndex);
            }
        };

        animate();
    },

    /**
     * Перерисовывает колесо с заданным углом поворота
     */
    drawWheelRotated(rotation) {
        if (!this.wheelCanvas) return;
        
        const ctx = this.wheelCanvas.getContext('2d');
        if (!ctx) return;

        const centerX = this.wheelCanvas.width / 2;
        const centerY = this.wheelCanvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Очищаем canvas
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, this.wheelCanvas.width, this.wheelCanvas.height);

        // Применяем ротацию
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.translate(-centerX, -centerY);

        // Рисуем сегменты колеса
        for (let segment of this.wheelSegments) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, segment.startAngle, segment.endAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = segment.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Рисуем текст слова
            const textAngle = (segment.startAngle + segment.endAngle) / 2;
            const textX = centerX + Math.cos(textAngle) * (radius * 0.65);
            const textY = centerY + Math.sin(textAngle) * (radius * 0.65);

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(textAngle + Math.PI / 2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const word = this.gameData[segment.itemIndex].text;
            const displayText = word.length > 12 ? word.substring(0, 10) + '...' : word;
            ctx.fillText(displayText, 0, 0);
            ctx.restore();
        }

        // Рисуем центральный круг
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Рисуем стрелку-указатель (вверху, всегда на месте)
        this.drawPointer(ctx, centerX, centerY - radius - 5);
    },

    /**
     * Вычисляет индекс сегмента под указателем для заданной абсолютной ротации (в радианах)
     * rotation — абсолютная ротация, которую мы применяли при рисовании (увеличивается с каждым оборотом)
     */
    getIndexForRotation(rotation) {
        if (!this.wheelSegments || this.wheelSegments.length === 0) return -1;
        const pointerAngle = -Math.PI / 2;
        const normRotation = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let effectiveAngle = (pointerAngle - normRotation + Math.PI * 2) % (Math.PI * 2);

        // Ищем сегмент, чей интервал содержит effectiveAngle
        for (let seg of this.wheelSegments) {
            let start = ((seg.startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            let end = ((seg.endAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            if (start <= end) {
                if (effectiveAngle >= start && effectiveAngle < end) return seg.itemIndex;
            } else {
                // Сегмент оборачивается через 2PI
                if (effectiveAngle >= start || effectiveAngle < end) return seg.itemIndex;
            }
        }
        return -1;
    },

    /**
     * Показывает результат - выбранное слово
     */
    showResult(index) {
        // Если передан индекс, используем его; иначе используем сохранённый selectedIndex
        const idx = (typeof index === 'number') ? index : this.selectedIndex;
    // (debug logs removed)
        if (idx < 0 || idx >= this.gameData.length) return;

    const selectedWord = this.gameData[idx].text;
        console.log(`FortuneWheelGame: Выбрано слово: "${selectedWord}"`);

        // Показываем в поле результата
        if (this.resultDisplay) {
            this.resultDisplay.textContent = `✨ Выбрано: ${selectedWord}`;
            this.resultDisplay.className = 'text-3xl font-bold text-indigo-600 text-center py-4';
        }

        // Показываем модальное окно с результатом
        if (this.statusModal && this.selectedWord) {
            this.selectedWord.textContent = selectedWord;
            this.statusModal.classList.remove('hidden');
        }
    },

    /**
     * Удаляет выбранное слово из списка и обновляет колесо
     */
    removeSelectedWord() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.gameData.length) return;

    const removedWord = this.gameData[this.selectedIndex].text;
        console.log(`FortuneWheelGame: Удалено слово: "${removedWord}"`);

        // Удаляем слово из массива
        this.gameData.splice(this.selectedIndex, 1);

        // Закрываем модальное окно
        this.closeModal();

        if (this.gameData.length === 0) {
            // Если слова закончились
            this.resultDisplay.textContent = '✅ Все слова удалены! Загрузите новый JSON.';
            this.resultDisplay.className = 'text-2xl font-bold text-green-600 text-center py-4';
            this.spinButton.disabled = true;
        } else {
            // Обновляем колесо
            this.initializeWheel();
            this.resultDisplay.textContent = `Слово "${removedWord}" удалено! Осталось ${this.gameData.length} слов.`;
            this.resultDisplay.className = 'text-lg font-semibold text-orange-600 text-center py-4';
        }
    },

    /**
     * Закрывает модальное окно
     */
    closeModal() {
        if (this.statusModal) {
            this.statusModal.classList.add('hidden');
        }
    }
};

// Инициализируем игру при загрузке страницы
window.addEventListener('load', () => FortuneWheelGame.init());
