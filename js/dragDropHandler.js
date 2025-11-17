/**
 * dragDropHandler.js - Обработчик Drag-and-Drop операций
 */

const DragDropHandler = {
    // Режим кликов: внутреннее состояние выбранной карточки слева
    selectedConceptId: null,
    selectedConceptEl: null,
    clicksDisabled: false,
    /**
     * Обработчик начала перетаскивания
     */
    // КЛИК ПО КОНЦЕПТУ (левая колонка)
    handleConceptClick(e) {
        if (GameState.isMaxErrorsReached() || DragDropHandler.clicksDisabled) return;
        const el = e.currentTarget;
        if (!el || el.style.visibility === 'hidden' || el.classList.contains('matched')) return;

        const id = parseInt(el.dataset.id);

        // Повторный клик по выбранному — сбрасываем выбор
        if (DragDropHandler.selectedConceptId === id) {
            DragDropHandler.clearSelection();
            return;
        }

        // Переключаем выбор на новую карточку
        DragDropHandler.clearSelection();
        DragDropHandler.selectedConceptId = id;
        DragDropHandler.selectedConceptEl = el;

        // Визуально обозначаем выбор
        el.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-2', 'selected');
    },

    /**
     * Обработчик dragover события
     */
    // КЛИК ПО ОПРЕДЕЛЕНИЮ (правая колонка)
    handleDefinitionClick(e) {
        if (DragDropHandler.clicksDisabled) return;
        const dropTarget = e.currentTarget;
        if (dropTarget.classList.contains('matched') || GameState.isMaxErrorsReached()) return;

        const conceptId = DragDropHandler.selectedConceptId;
        const draggedElement = DragDropHandler.selectedConceptEl;

        if (conceptId === null || !draggedElement) {
            // Ничего не выбрано — краткий намёк (подсветим карточку)
            dropTarget.classList.add('drag-over');
            setTimeout(() => dropTarget.classList.remove('drag-over'), 200);
            return;
        }

        const definitionMatchId = parseInt(dropTarget.dataset.matchId);

        if (conceptId === definitionMatchId) {
            // УСПЕШНОЕ СОВПАДЕНИЕ
            DragDropHandler.handleSuccessfulMatch(draggedElement, dropTarget, conceptId);
        } else {
            // ОШИБКА
            DragDropHandler.handleMismatch(draggedElement, dropTarget);
        }

        // Сбрасываем выбор после попытки
        DragDropHandler.clearSelection();
    },

    /**
     * Обработчик dragenter события
     */
    handleDragEnter(e) {
        if (!GameState.isMaxErrorsReached()) {
            e.currentTarget.classList.add('drag-over');
        }
    },

    /**
     * Обработчик dragleave события
     */
    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    },

    /**
     * Обработчик drop события
     */
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const dropTarget = e.currentTarget;
        if (dropTarget.classList.contains('matched') || GameState.isMaxErrorsReached()) return;

        const conceptId = GameState.draggedCardId;
        if (conceptId === null) return;

        const definitionMatchId = parseInt(dropTarget.dataset.matchId);
        const draggedElement = document.querySelector(`#game-grid [data-id="${conceptId}"]`);

        if (conceptId === definitionMatchId) {
            // УСПЕШНОЕ СОВПАДЕНИЕ
            DragDropHandler.handleSuccessfulMatch(draggedElement, dropTarget, conceptId);
        } else {
            // ОШИБКА
            DragDropHandler.handleMismatch(draggedElement, dropTarget);
        }

        GameState.draggedCardId = null;
    },

    /**
     * Обработка успешного совпадения
     */
    handleSuccessfulMatch(draggedElement, dropTarget, conceptId) {
        const conceptCardData = GameState.currentCardData.find(c => c.id === conceptId);
        const conceptContent = conceptCardData ? conceptCardData.content : 'Концепция';
        const definitionContent = dropTarget.dataset.content;

        CardManager.markAsMatched(draggedElement, dropTarget, conceptContent, definitionContent);

        GameState.incrementMatched();
        UIManager.updateScore(GameState.matchedPairs, GameState.totalPairs);

        if (GameState.isAllMatched()) {
            GameTimer.stop();
            DragDropHandler.disableClicks();
            setTimeout(() => UIManager.showGameStatusModal('win'), 500);
        }
    },

    /**
     * Обработка неправильного сопоставления
     */
    handleMismatch(draggedElement, dropTarget) {
        // Если нет штрафов за ошибки (maxErrors = Infinity), только показываем ошибку
        if (GameState.MAX_ERRORS === Infinity) {
            CardManager.showError(dropTarget);
            // Визуально сбросим выделение у выбранного концепта, если было
            DragDropHandler.clearSelection();
            return;
        }

        // Иначе увеличиваем счётчик ошибок
        GameState.incrementErrors();
        UIManager.updateErrorCount(GameState.errorCount);

        CardManager.showError(dropTarget);
        DragDropHandler.clearSelection();

        if (GameState.isMaxErrorsReached()) {
            GameTimer.stop();
            DragDropHandler.disableClicks();
            setTimeout(() => UIManager.showGameStatusModal('game-over'), 700);
        }
    },

    /**
     * Обработка истечения времени
     */
    handleTimeExpired() {
        // Блокируем клики
        DragDropHandler.disableClicks();
        setTimeout(() => UIManager.showGameStatusModal('game-over'), 700);
    },

    // Сбрасывает текущий выбор концепта
    clearSelection() {
        if (DragDropHandler.selectedConceptEl) {
            DragDropHandler.selectedConceptEl.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-2', 'selected');
        }
        DragDropHandler.selectedConceptId = null;
        DragDropHandler.selectedConceptEl = null;
    },

    // Полностью отключает клики по всем карточкам (для конца игры/таймера)
    disableClicks() {
        DragDropHandler.clicksDisabled = true;
        const grid = document.getElementById('game-grid');
        if (grid) grid.classList.add('pointer-events-none');
    }
};
