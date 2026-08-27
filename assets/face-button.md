# face-button.svg — инструкция по настройке

`face-button.svg` — универсальный модуль круглой правой кнопки геймпада. Один и тот же SVG можно использовать для PlayStation-стиля, Xbox-стиля, Nintendo-стиля или полностью своего дизайна.

## Подключение в HTML

Рекомендуемый вариант — через `<object>`, потому что тогда HTML/JS может обращаться к API внутри SVG:

```html
<object id="faceButton"
        type="image/svg+xml"
        data="assets/face-button.svg"
        width="64"
        height="64"></object>
```

После загрузки SVG доступен объект `FaceButton`:

```js
const button = document.getElementById('faceButton');

button.addEventListener('load', () => {
  button.contentWindow.FaceButton.set({
    symbol: 'cross',
    fill: '#f5f6f8',
    edge: '#cfd4dc',
    symbolColor: '#20242b',
    glow: '#6f7cff',
    pressed: false
  });
});
```

## Основные параметры

Метод `FaceButton.set({...})` принимает:

| Параметр | Что меняет | Пример |
|---|---|---|
| `symbol` | рисунок/букву | `a`, `b`, `x`, `y`, `square`, `triangle`, `circle`, `cross` |
| `fill` | цвет самой круглой кнопки | `#f5f6f8` |
| `edge` | цвет внешнего ободка | `#cfd4dc` |
| `symbolColor` | цвет рисунка/буквы | `#20242b` |
| `glow` | цвет реакции при нажатии | `#735cff` |
| `symbolStroke` | толщина геометрического символа | `6` |
| `scale` | дополнительный масштаб внутри viewBox | `1` |
| `pressed` | состояние нажатия | `true` / `false` |

Важно: `fill` меняет именно цвет корпуса кнопки. `symbolColor` меняет только символ. Они полностью независимы.

## Доступные символы

```js
FaceButton.set({ symbol: 'a' });
FaceButton.set({ symbol: 'b' });
FaceButton.set({ symbol: 'x' });
FaceButton.set({ symbol: 'y' });
FaceButton.set({ symbol: 'square' });
FaceButton.set({ symbol: 'triangle' });
FaceButton.set({ symbol: 'circle' });
FaceButton.set({ symbol: 'cross' });
```

## PlayStation / DualSense-стиль

Белая кнопка с тёмным символом:

```js
FaceButton.set({
  symbol: 'cross',
  fill: '#f5f6f8',
  edge: '#cfd4dc',
  symbolColor: '#20242b',
  glow: '#7f8cff'
});
```

Тёмная кнопка с белым символом:

```js
FaceButton.set({
  symbol: 'circle',
  fill: '#171b24',
  edge: '#4a5260',
  symbolColor: '#f5f6f8',
  glow: '#7f8cff'
});
```

Для четырёх правых кнопок используются символы:

```text
верх:    triangle
право:   circle
низ:     cross
лево:    square
```

В SVG также есть встроенная палитра `playstationDualSense`, которая меняет цвет символа на светлый:

```js
FaceButton.palette('playstationDualSense', 'cross');
```

После `palette()` при необходимости отдельно задавай цвет корпуса через `set({ fill: ... })`.

## Xbox-стиль

Классические цвета Microsoft для обозначений ABXY уже встроены в палитру `xbox`:

```js
FaceButton.palette('xbox', 'a'); // зелёный
FaceButton.palette('xbox', 'b'); // красный
FaceButton.palette('xbox', 'x'); // синий
FaceButton.palette('xbox', 'y'); // жёлтый
```

Палитра меняет цвет символа. Если нужно, чтобы цветной была именно вся кнопка, используй те же цвета как `fill`:

```js
const xbox = {
  a: '#107C10',
  b: '#E81123',
  x: '#0078D7',
  y: '#FFB900'
};

FaceButton.set({
  symbol: 'a',
  fill: xbox.a,
  edge: '#0a4f0a',
  symbolColor: '#ffffff',
  glow: xbox.a
});
```

## Nintendo-стиль

Для Switch обычно используется тёмная кнопка со светлой буквой:

```js
FaceButton.set({
  symbol: 'a',
  fill: '#20242b',
  edge: '#4d5562',
  symbolColor: '#f2f2f2',
  glow: '#7f8cff'
});
```

Расположение букв на Nintendo отличается от Xbox. Это задаётся не самим SVG, а тем, какой `symbol` присвоен конкретной позиции в контроллере.

Пример раскладки Nintendo:

```text
верх:    x
право:   a
низ:     b
лево:    y
```

## Полностью свой контроллер

Любой цвет можно задавать напрямую:

```js
FaceButton.set({
  symbol: 'triangle',
  fill: '#ff5aa5',
  edge: '#7a2451',
  symbolColor: '#ffffff',
  glow: '#ff5aa5',
  symbolStroke: 5.5
});
```

## Назначение клавиш

SVG отвечает только за внешний вид и состояние. Назначение физической кнопки хранится в HTML/JS контроллера.

Пример:

```js
const config = {
  controller: 'playstation',
  position: 'bottom',
  gamepadButton: 0,
  symbol: 'cross',
  action: 'jump',
  fill: '#f5f6f8',
  symbolColor: '#20242b'
};
```

При чтении Gamepad API:

```js
const gp = navigator.getGamepads()[0];
const pressed = gp?.buttons[config.gamepadButton]?.pressed ?? false;

button.contentWindow.FaceButton.set({
  symbol: config.symbol,
  fill: config.fill,
  symbolColor: config.symbolColor,
  pressed
});
```

Таким образом один SVG можно привязать к любому индексу Gamepad API и к любому действию приложения.

## Четыре правые кнопки как модуль

Удобно хранить конфигурацию отдельно:

```js
const faceButtons = [
  { id:'top',    gamepadButton:3, symbol:'triangle' },
  { id:'right',  gamepadButton:1, symbol:'circle' },
  { id:'bottom', gamepadButton:0, symbol:'cross' },
  { id:'left',   gamepadButton:2, symbol:'square' }
];
```

Для Xbox:

```js
const faceButtons = [
  { id:'top',    gamepadButton:3, symbol:'y' },
  { id:'right',  gamepadButton:1, symbol:'b' },
  { id:'bottom', gamepadButton:0, symbol:'a' },
  { id:'left',   gamepadButton:2, symbol:'x' }
];
```

Для Nintendo:

```js
const faceButtons = [
  { id:'top',    symbol:'x' },
  { id:'right',  symbol:'a' },
  { id:'bottom', symbol:'b' },
  { id:'left',   symbol:'y' }
];
```

## Состояние нажатия

```js
FaceButton.set({ pressed: true });
```

При `pressed:true` кнопка немного визуально утапливается, а ободок получает цвет `glow`.

Сброс:

```js
FaceButton.set({ pressed: false });
```

## Управление через postMessage

Если прямой доступ к `contentWindow.FaceButton` неудобен, SVG принимает сообщения:

```js
button.contentWindow.postMessage({
  type: 'D5BT_FACE_BUTTON',
  symbol: 'a',
  fill: '#107C10',
  symbolColor: '#ffffff',
  glow: '#107C10',
  pressed: true
}, '*');
```

## Чтение текущих настроек

```js
const state = button.contentWindow.FaceButton.get();
console.log(state);
```

Возвращаются текущий символ, состояние нажатия и основные цвета.

## Рекомендуемая архитектура D5BT

Не копировать SVG-код четыре раза. Использовать один `assets/face-button.svg` как ресурс и создавать 4 экземпляра через `<object>`. Для каждой позиции хранить только конфигурацию: `controller`, `symbol`, `gamepadButton`, `action`, `fill`, `edge`, `symbolColor`, `glow`.

Тогда смена типа контроллера выполняется одной функцией, которая меняет конфигурацию четырёх экземпляров, а сам SVG остаётся один.
