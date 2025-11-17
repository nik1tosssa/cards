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

        cardElement.className = 'card p-4 md:p-6 rounded-xl border-2 transition duration-300 ease-in-out shadow-md text-center flex items-center justify-center';

        cardElement.dataset.id = card.id;
        cardElement.dataset.matchId = card.matchId;
        cardElement.dataset.content = card.content;

        if (isDraggable) {
            cardElement.classList.add('concept', 'cursor-grab', 'hover:shadow-lg');
            cardElement.setAttribute('draggable', 'true');
            cardElement.addEventListener('dragstart', DragDropHandler.handleDragStart);
            cardElement.innerHTML = `<p class="font-semibold text-lg md:text-xl">${card.content}</p>`;
        } else {
            cardElement.classList.add('definition', 'hover:shadow');
            cardElement.addEventListener('dragover', DragDropHandler.handleDragOver);
            cardElement.addEventListener('dragenter', DragDropHandler.handleDragEnter);
            cardElement.addEventListener('dragleave', DragDropHandler.handleDragLeave);
            cardElement.addEventListener('drop', DragDropHandler.handleDrop);

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

        gridElement.innerHTML = '';
        gridElement.style.display = 'grid';

        for (let i = 0; i < totalPairs; i++) {
            const leftCard = leftCards[i];
            const rightCard = rightCards[i];

            gridElement.appendChild(this.createCardElement(leftCard, true));
            gridElement.appendChild(this.createCardElement(rightCard, false));
        }
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

        definitionElement.classList.remove('definition', 'hover:shadow', 'items-center', 'justify-center');
        definitionElement.classList.add('matched', 'flex-col', 'justify-start', 'pt-6', 'pb-6');
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
};
