/**
 * cardManager.js - Управление карточками
 */

const CardManager = {
    /**
     * Перемешивает массив с использованием алгоритма Фишера-Йейтса
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Создает элемент карточки DOM
     */
    createCardElement(card, isDraggable) {
        const cardElement = document.createElement('div');

        // Автовысота без скролла: карточка занимает столько места, сколько нужно
        // Добавляем перенос длинных слов и сохранение переводов строк
        cardElement.className = 'card p-4 md:p-6 rounded-xl border-2 transition duration-300 ease-in-out shadow-md text-center flex items-center justify-center break-words whitespace-pre-wrap';

        cardElement.dataset.id = card.id;
        cardElement.dataset.matchId = card.matchId;
        cardElement.dataset.content = card.content;

        if (isDraggable) {
            // Режим кликов: выбираем концепт кликом
            cardElement.classList.add('concept', 'cursor-pointer', 'hover:shadow-lg');
            cardElement.addEventListener('click', DragDropHandler.handleConceptClick);
            cardElement.innerHTML = `<p class="font-semibold text-lg md:text-xl">${card.content}</p>`;
        } else {
            // Режим кликов: кликаем по определению для проверки совпадения с выбранным концептом
            cardElement.classList.add('definition', 'hover:shadow', 'cursor-pointer');
            cardElement.addEventListener('click', DragDropHandler.handleDefinitionClick);

            cardElement.innerHTML = `<p class="font-medium text-base md:text-lg text-gray-700">${card.content}</p>`;
        }

        return cardElement;
    },

    /**
     * Разделяет карточки на две группы по типам
     * Использует первый и второй уникальные типы из данных
     */
    separateCards(cardData) {
        // Получаем уникальные типы
        const types = Array.from(new Set(cardData.map(c => c.type)));
        
        // Если есть оба типа (старая модель с concept/definition)
        if (types.includes('concept') && types.includes('definition')) {
            const concepts = cardData.filter(c => c.type === 'concept');
            const definitions = cardData.filter(c => c.type === 'definition');
            return {
                leftCards: this.shuffleArray(concepts),
                rightCards: this.shuffleArray(definitions),
            };
        }
        
        // Новая модель или пользовательские типы - разделяем по первым двум типам
        if (types.length >= 2) {
            const leftCards = cardData.filter(c => c.type === types[0]);
            const rightCards = cardData.filter(c => c.type === types[1]);
            return {
                leftCards: this.shuffleArray(leftCards),
                rightCards: this.shuffleArray(rightCards),
            };
        }

        // Fallback: если только один тип, разделяем пополам
        const shuffled = this.shuffleArray([...cardData]);
        const half = Math.floor(shuffled.length / 2);
        return {
            leftCards: shuffled.slice(0, half),
            rightCards: shuffled.slice(half),
        };
    },

    /**
     * Рендерит карточки в игровое поле
     */
    renderCards(gridElement, cardData, totalPairs) {
        const { leftCards, rightCards } = this.separateCards(cardData);

        // Подготовка контейнера: две колонки
        gridElement.innerHTML = '';
        gridElement.className = '';
        gridElement.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');

        // Создаём левый и правый столбцы
        const leftColumn = document.createElement('div');
        leftColumn.id = 'left-column';
        leftColumn.className = 'flex flex-col gap-4';

        const rightColumn = document.createElement('div');
        rightColumn.id = 'right-column';
        rightColumn.className = 'flex flex-col gap-4';

        // Количество пар не должно превышать доступные карты в каждой колонке
        const pairs = Math.min(
            totalPairs,
            leftCards.length,
            rightCards.length
        );

        for (let i = 0; i < pairs; i++) {
            const leftCard = leftCards[i];
            const rightCard = rightCards[i];

            if (leftCard) leftColumn.appendChild(this.createCardElement(leftCard, true));
            if (rightCard) rightColumn.appendChild(this.createCardElement(rightCard, false));
        }

        gridElement.appendChild(leftColumn);
        gridElement.appendChild(rightColumn);

        // После отрисовки выравниваем высоту всех карточек по самой высокой
        this.equalizeCardHeights(gridElement);
    },

    /**
     * Помечает карточку как совпавшую
     */
    markAsMatched(conceptElement, definitionElement, conceptContent, definitionContent) {
        // Скрываем концепцию
        if (conceptElement) {
            conceptElement.style.visibility = 'hidden';
            conceptElement.classList.remove('opacity-50');
        }

        // Обновляем определение
        definitionElement.innerHTML = `
            <div class="text-xl font-bold text-gray-800 mb-1">${conceptContent}</div>
            <div class="text-gray-700 text-base px-2">${definitionContent}</div>
        `;

        // Снимаем временные/интерактивные стили
        definitionElement.classList.remove('definition', 'hover:shadow', 'items-center', 'justify-center', 'drag-over', 'drag-error');

        // Добавляем оформление успешного совпадения (зелёная подсветка)
        definitionElement.classList.add(
            'matched',
            'flex-col',
            'justify-start',
            'pt-6',
            'pb-6',
            'bg-green-50',
            'border-green-400',
            'shadow-md'
        );

        // Контент правой карточки стал больше — переравняем высоты всех карточек
        // Делаем после перерисовки, чтобы измерения были корректны
        requestAnimationFrame(() => {
            const grid = document.getElementById('game-grid');
            if (grid) this.equalizeCardHeights(grid);
        });
    },

    /**
     * Показывает ошибку на карточке-определении
     */
    showError(definitionElement) {
        definitionElement.classList.add('drag-error');
        setTimeout(() => {
            definitionElement.classList.remove('drag-error');
        }, 700);
    },

    /**
     * Восстанавливает визуальное состояние концепции после неудачного перетаскивания
     */
    resetConceptVisuals(conceptElement) {
        if (conceptElement) {
            conceptElement.classList.remove('opacity-50');
        }
    },

    /**
     * Выравнивает высоту всех карточек внутри грида по высоте самой высокой
     */
    equalizeCardHeights(gridElement) {
        if (!gridElement) return;

        const cards = gridElement.querySelectorAll('.card');
        if (!cards.length) return;

        // Сбрасываем высоту, чтобы корректно измерить естественную
        cards.forEach(card => {
            card.style.height = 'auto';
        });

        // Находим максимальную высоту
        let maxHeight = 0;
        cards.forEach(card => {
            const h = card.offsetHeight;
            if (h > maxHeight) maxHeight = h;
        });

        // Применяем одинаковую высоту ко всем карточкам
        cards.forEach(card => {
            card.style.height = `${maxHeight}px`;
        });
    },
};
