# Архитектура проекта "Соотнеси карточки"

## Диаграмма взаимодействия модулей

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HTML СТРАНИЦА                                │
│                      (index_new.html)                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    CSS СТИЛИ (styles.css)                           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────────┐
        │         JAVASCRIPT МОДУЛИ (js/)                 │
        ├─────────────────────────────────────────────────┤
        │                                                 │
        │  ┌──────────────────┐                           │
        │  │  GameController  │ (Главный управляющий)    │
        │  │   (game.js)      │                           │
        │  └────────┬─────────┘                           │
        │           │                                     │
        │     ┌─────┴─────────────────────┐               │
        │     ↓                           ↓               │
        │  ┌────────────┐         ┌──────────────┐        │
        │  │ GameState  │         │  UIManager   │        │
        │  │            │         │              │        │
        │  │ • Данные   │         │ • DOM refs   │        │
        │  │ • Счета    │         │ • Обновления│        │
        │  │ • Флаги    │         │ • Модали    │        │
        │  └────────────┘         └──────────────┘        │
        │                               ↑                 │
        │  ┌──────────────┐             │                 │
        │  │ CardManager  │             │                 │
        │  │              │             │                 │
        │  │ • Создание   │             │                 │
        │  │ • Рендер     │             │                 │
        │  │ • Маркировка │─────────────┘                 │
        │  └──────┬───────┘                               │
        │         │                                       │
        │  ┌──────↓──────────┐    ┌──────────────┐        │
        │  │ DragDropHandler│    │   GameTimer  │        │
        │  │                │    │              │        │
        │  │ • dragstart    │    │ • start()    │        │
        │  │ • dragover     │    │ • stop()     │        │
        │  │ • drop         │    │ • format()   │        │
        │  │ • match/error  │    └──────────────┘        │
        │  └────────────────┘                             │
        │                                                 │
        │  ┌──────────────┐    ┌──────────────┐           │
        │  │  FileLoader  │    │    (Styles)  │           │
        │  │              │    │              │           │
        │  │ • load file  │    │ • CSS classes│           │
        │  │ • parse JSON │    │ • Animations │           │
        │  │ • validate   │    │ • Layout     │           │
        │  └──────────────┘    └──────────────┘           │
        │                                                 │
        └─────────────────────────────────────────────────┘
```

## Поток выполнения игры

### Инициализация
```
window.load
    ↓
GameController.init()
    ├─ UIManager.init() - кэшируем DOM элементы
    ├─ Привязываем обработчики событий
    │   ├─ restart-button → GameController.startGame()
    │   ├─ json-file input → FileLoader.handleFileLoad()
    │   └─ restart-button-modal → GameController.startGame()
    └─ GameController.startGame() - первый запуск
```

### Запуск игры
```
GameController.startGame(data)
    ├─ GameState.reset() - очищаем состояние
    ├─ UIManager.resetUI() - сбрасываем UI
    ├─ GameTimer.reset() - сбрасываем таймер
    ├─ GameState.setCardData(data) - загружаем данные
    ├─ UIManager.updateScore() - показываем счет
    ├─ CardManager.renderCards() - рендерим карточки
    │   ├─ CardManager.separateCards() - разделяем на концепции и определения
    │   ├─ CardManager.shuffleArray() - перемешиваем
    │   └─ CardManager.createCardElement() - создаем DOM элементы
    └─ GameTimer.start() - запускаем таймер
```

### Перетаскивание карточки
```
Пользователь перетаскивает концепцию на определение
    ↓
DragDropHandler.handleDragStart()
    ├─ GameState.draggedCardId = id концепции
    └─ Добавляем класс opacity-50
    ↓
DragDropHandler.handleDragOver/Enter()
    ├─ Добавляем класс drag-over (желтый фон)
    └─ UIManager обновляет стили
    ↓
DragDropHandler.handleDrop()
    ├─ Проверяем: conceptId === definitionMatchId?
    ├─ ДА → DragDropHandler.handleSuccessfulMatch()
    │   ├─ CardManager.markAsMatched() - скрываем концепцию, обновляем определение
    │   ├─ GameState.incrementMatched()
    │   ├─ UIManager.updateScore()
    │   ├─ Проверяем победу → UIManager.showGameStatusModal('win')
    │   └─ GameTimer.stop()
    │
    └─ НЕТ → DragDropHandler.handleMismatch()
        ├─ GameState.incrementErrors()
        ├─ UIManager.updateErrorCount()
        ├─ CardManager.showError() - красный фон на 700ms
        ├─ Проверяем: errorCount >= MAX_ERRORS?
        │   ├─ ДА → UIManager.showGameStatusModal('game-over')
        │   │    └─ GameTimer.stop()
        │   └─ НЕТ → Игра продолжается
        └─ GameState.draggedCardId = null
```

### Загрузка файла
```
Пользователь выбирает JSON файл
    ↓
FileLoader.handleFileLoad()
    ├─ Проверяем MIME type
    ├─ Читаем файл
    ├─ Парсим JSON
    ├─ FileLoader.validateCardData() - валидируем
    ├─ GameController.startGame(loadedData) - запускаем с новыми данными
    └─ UIManager.showLoadingMessage() - показываем статус
```

## Состояния CardState

```
┌──────────────────────────────────────┐
│        ИГРА НЕ НАЧАТА               │
│  • matchedPairs = 0                 │
│  • errorCount = 0                   │
│  • draggedCardId = null             │
└──────────────────┬───────────────────┘
                   │ startGame()
                   ↓
┌──────────────────────────────────────┐
│        ИГРА ИДЕТ                    │
│  • Игрок перетаскивает карточки     │
│  • Таймер работает                  │
│  • Ошибки считаются                 │
└──────────────────┬───────────────────┘
         ┌─────────┴─────────┐
         ↓                   ↓
    ┌─────────────┐    ┌──────────────┐
    │   ПОБЕДА    │    │   ПРОИГРЫШ   │
    │ matchedPairs│    │  errorCount  │
    │    ==      │    │     ==       │
    │ totalPairs │    │  MAX_ERRORS  │
    └─────────────┘    └──────────────┘
         │                   │
         └─────────┬─────────┘
                   ↓
       ┌────────────────────────┐
       │  МОДАЛЬНОЕ ОКНО       │
       │  "Играть еще раз?"    │
       └────────────┬───────────┘
                    │ Нажата кнопка
                    ↓
            GameController.startGame()
```

## Зависимости между модулями

```
game.js
    ├─ GameController → использует все модули
    └─ Инициализирует при window.load

gameState.js
    └─ Независим, хранит только данные

timer.js
    └─ Независим, логика таймера

cardManager.js
    ├─ Использует GameState (для получения данных)
    ├─ Использует DragDropHandler (привязывает обработчики)
    └─ Взаимодействует с DOM

dragDropHandler.js
    ├─ Использует GameState (читает/записывает состояние)
    ├─ Использует CardManager (для операций с карточками)
    ├─ Использует UIManager (для обновления UI)
    ├─ Использует GameTimer (для остановки при окончании)
    └─ Вызывает обработчики событий

gameUI.js
    ├─ Использует GameState (для получения информации)
    ├─ Использует GameTimer (форматирование времени)
    └─ Управляет DOM

fileLoader.js
    ├─ Использует UIManager (для сообщений)
    └─ Использует GameController (для запуска игры)
```

## Типы карточек

### Concept (Концепция)
- Перетаскиваемая
- Слева в гриде
- Голубой фон
- При совпадении: скрывается

### Definition (Определение)
- Зона сброса
- Справа в гриде
- Белый фон с пунктиром
- При совпадении: показывает оба текста

## Классы CSS и их роли

```
.card              - базовые стили карточки
.concept           - стиль концепции (голубой)
.definition        - стиль определения (белый, пунктир)
.matched           - стиль совпавшей пары (зелёный)
.drag-over         - при наведении (жёлтый)
.drag-error        - ошибка сопоставления (красный)
.opacity-50        - карточка при перетаскивании
```
