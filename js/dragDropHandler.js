/**
 * dragDropHandler.js - Обработчик Drag-and-Drop операций
 */

const DragDropHandler = {
    /**
     * Обработчик начала перетаскивания
     */
    handleDragStart(e) {
        if (GameState.isMaxErrorsReached()) return;

        GameState.draggedCardId = parseInt(e.target.dataset.id);
        e.dataTransfer.setData('text/plain', GameState.draggedCardId);
        e.target.classList.add('opacity-50');
    },

    /**
     * Обработчик dragover события
     */
    handleDragOver(e) {
        e.preventDefault();
        if (!e.currentTarget.classList.contains('matched') && !GameState.isMaxErrorsReached()) {
            e.currentTarget.classList.add('drag-over');
        }
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
            setTimeout(() => UIManager.showGameStatusModal('win'), 500);
        }
    },

    /**
     * Обработка неправильного сопоставления
     */
    handleMismatch(draggedElement, dropTarget) {
        GameState.incrementErrors();
        UIManager.updateErrorCount(GameState.errorCount);

        CardManager.showError(dropTarget);
        CardManager.resetConceptVisuals(draggedElement);

        if (GameState.isMaxErrorsReached()) {
            GameTimer.stop();
            document.querySelectorAll('.card.concept').forEach(card => card.setAttribute('draggable', 'false'));
            setTimeout(() => UIManager.showGameStatusModal('game-over'), 700);
        }
    },
};
