
# 一、konva 是什么？

konva 是一个对 canvas API 做了封装增强的 JavaScript 库。

HTML 原生的 canva 提供的 API 比较底层，用法上像是操纵一支画笔进行各种操作，画完就结束了。

canvas 本身不维护图形树，你也无法操作修改已被绘制的图形。

而 konva 能够像我们操作 DOM 树一样去绘制和维护元素，它会额外维护图形构成的树，并能在绘制后，对特定图形进行样式的修改。

你还可以在上面添加事件，比如鼠标滑入某图形时，图形变大一点。此外还支持方便的变形、动画、拖拽等高级能力。

安装
--

和大多数的 JS 库一样，我们可以用包管理器安装：

```sh
npm install konva
# 或者
yarn add konva
```

或者用 script 标签引入一个全局的对象

```html
<script src="./konva.min.js"></script>
```

下面我们就简单看一个例子。

绘制一个矩形
------

首先我们用 Konva.Stage 构建一个舞台（stage）。

```js
const stage = new Konva.Stage({
  container: '#container',
  width: 300,
  height: 300
});
```

执行后，konva 会在 div#container 下创建一个 div，然后在这个 div 下再创建宽高各为 300px 的 canvas 元素。

前提是 stage 里面有元素存在，否则 canvas 不会被创建。

舞台有了，我们该在上面添加图形了，但直接在 stage 下添加图形是不允许的。我们需要先创建一个图层（Layer）。

```js
const layer = new Konva.Layer();
```

图层就像是重叠在一起的多张透明的纸，可以很方便地管理多组图形，比如隐藏某个图层，等比放大某个图层。

创建完图层后，我们就可以在上面添加图形了。这里我们创建一个矩形。

```js
const rect = new Konva.Rect({
  x: 20,
  y: 20,
  width: 200,
  height: 200,
  fill: 'orange'
});
```

我们指定了矩形的左上角坐标、宽高以及填充色。

最后我们将这些对象组合起来，形成类似 DOM 结构的树：

```js
layer.add(rect);
stage.add(layer);
```

于是矩形被绘制出来了。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a150cf397a049b79334b106445dbfcf~tplv-k3u1fbpfcp-zoom-1.image)

Demo 地址：

https://codepen.io/F-star/pen/oNErwmW?editors=0010

结尾
--

konva 能够让我们像写 DOM 对象或者是 SVG 对象那样，去控制 canvas 里的图形，让基于 canvas 做一些复杂的项目变得简单。

今天我们简单了解了一下 konva 是什么，并写了一个 demo 让大家对 konva 的用法有一个印象。

这是系列文章，后续会继续讲解 konva 的用法，我是前端西瓜哥，欢迎关注我。

> 本文首发于我的公众号：前端西瓜哥

