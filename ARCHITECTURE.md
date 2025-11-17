# 🏗️ Архитектура проекта "Карточки"

## Диаграмма структуры приложения

```
┌─────────────────────────────────────┐
│      ГЛАВНАЯ СТРАНИЦА               │
│         index.html                  │
│  Выбор активности (4 кнопки)        │
└────────────────┬────────────────────┘
        ↓        ↓        ↓        ↓
    ┌───┴──┐  ┌──┴───┐  ┌──────┐  ┌────────┐
    │      │  │      │  │      │  │        │
matches   fortune flash  practice
.html    Wheel  cards   .html
.html    .html
    │      │  │      │  │      │  │        │
    └──────┴──┴───┬──┴──┴──────┴──┴────────┘
                  ↓
         ┌─────────────────┐
         │   styles.css    │
         │  (Tailwind CSS) │
         └─────────────────┘
```

## Архитектура Соотнеси карточки (matches.html)

```
┌─────────────────────────────────────────────────────┐
│              matches.html                           │
│         (HTML структура и DOM элементы)            │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│           JavaScript контроллер                     │
│            game.js (GameController)                 │
│  - init() - инициализация при загрузке             │
│  - startGame(data) - запуск игры                    │
│  - координирует все модули                          │
└─┬──┬──┬─────┬──────────┬──────────────┬────────────┘
  │  │  │     │          │              │
  ↓  ↓  ↓     ↓          ↓              ↓
┌──┐ ┌──┐ ┌────┐  ┌──────┐  ┌─────────┐ ┌────────┐
│GS│ │TM│ │CM  │  │DDH   │  │GM       │ │FL      │
└──┘ └──┘ └────┘  └──────┘  └─────────┘ └────────┘
Game Timer Card  Drag      Game      File
State      Manager DropH    UI        Loader
```

### Поток данных

```
1. Загрузка страницы
   ↓
   GameController.init()
   - Инициализирует все модули
   - Привязывает обработчики событий
   - Загружает пример данных

2. Загрузка JSON файла
   ↓
   FileLoader.handleFileLoad(event)
   - Читает файл
   - Парсит JSON
   - Валидирует структуру
   ↓
   GameController.startGame(data)

3. Начало игры
   ↓
   - GameState.reset()
   - GameState.setCardData(data)
   - GameTimer.start()
   - CardManager.renderCards()

4. Перетаскивание карточки
   ↓
   DragDropHandler.handleDragStart/Drop()
   ↓
   Проверка: совпадает ли?
   ├─ ДА → handleSuccessfulMatch()
   │       - GameState.incrementMatched()
   │       - CardManager.markAsMatched()
   │       - GameUI.updateScore()
   │
   └─ НЕТ → handleMismatch()
           - GameState.incrementErrors()
           - GameUI показывает ошибку
           - Если ошибок >= 5 → конец игры

5. Окончание игры
   ↓
   GameTimer.stop()
   ↓
   GameUI.showGameStatusModal()
   - Показывает результаты
   - Предлагает играть снова
```

## Архитектура Колеса Фортуны (fortuneWheel.html)

```
┌─────────────────────────────────────────────┐
│         fortuneWheel.html                   │
│  - Canvas для рисования колеса              │
│  - Модаль для результата                    │
│  - Кнопка вращения                          │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│     js/fortuneWheel.js                      │
│   (FortuneWheelGame - синглтон)             │
│                                              │
│  - init() - инициализация                   │
│  - loadGameData() - загрузить данные        │
│  - initializeWheel() - рисовать колесо      │
│  - spin() - вращение (2 сек)               │
│  - showResult() - показать результат        │
│  - removeSelectedWord() - удалить слово     │
│  - closeModal() - закрыть окно              │
└─────────────────────────────────────────────┘
                 ↓
         Читает JSON:
    ["Слово1", "Слово2", ...]
```

### Поток вращения колеса

```
1. Пользователь нажимает "Вращать колесо"
   ↓
   FortuneWheelGame.spin()
   - Проверка: не вращается ли уже?
   - Выбор случайного индекса
   - Расчет целевого угла поворота
   ↓

2. Анимация вращения (2 секунды)
   ↓
   requestAnimationFrame() цикл
   - Применяет ease-out функцию
   - Рисует колесо в новом положении
   - Обновляет угол поворота
   ↓

3. Конец анимации
   ↓
   FortuneWheelGame.showResult()
   - Показывает выбранное слово в модали
   - Сохраняет selectedIndex
   ↓

4. Пользователь может удалить слово
   ↓
   FortuneWheelGame.removeSelectedWord()
   - Удаляет из gameData массива
   - Пересчитывает wheelSegments
   - Перерисовывает колесо
   - Закрывает модаль
```

## Модульные зависимости

### matches.html зависит от:
```
game.js
├── gameState.js (состояние)
├── timer.js (таймер)
├── cardManager.js (карточки)
│   └── Внутреннее состояние
├── dragDropHandler.js (drag-drop)
│   ├── gameState (проверка совпадения)
│   └── gameUI (обновление интерфейса)
├── gameUI.js (интерфейс)
│   └── gameState (для обновлений)
└── fileLoader.js (загрузка JSON)
    └── Внутреннее состояние
```

### fortuneWheel.html зависит от:
```
fortuneWheel.js
└── Только встроенная логика (синглтон)
```

### index.html зависит от:
```
activitySelector.js
└── Только встроенная логика
```

## 🎨 Стили (styles.css)

- Использует Tailwind CSS (CDN)
- Определяет общие классы для всех страниц
- Адаптивный дизайн (mobile-first)
- Анимации и переходы
- Цветовая схема (индиго, серый, красный, зеленый)
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
