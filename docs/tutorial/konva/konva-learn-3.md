# 三、自定义图形

大家好，我是前端西瓜哥。

我们来看下怎么用 kanva 绘制自定义图形。

现在我们要绘制一个菱形。所谓菱形，就是所有边相等的四边形。

我们需要传入 `(x, y)` 设置菱形的左上角，并用 `width` 和 `height` 设置菱形的宽高。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93308b29c41b4c099b69a8a5fa4b2cca~tplv-k3u1fbpfcp-zoom-1.image)

Konva.Shape 类
-------------

我们需要 new 一个 Konva.Shape 对象，并编写 senceFunc 函数，来描述图形。

```js
const diamond = new Konva.Shape({
  sceneFunc(ctx, shape) {
    // 绘制你自己自定义的形状
  },
  width: 60,
  height: 100
});
```

senceFunc 函数接收 konva 传入的 canva 上下文 ctx，和一个 shape 对象。

ctx 是对 canvas 的 2d context 的增强，除了原本的属性和方法，还提供了 konva 专用的一些方法。我们需要用这个 ctx 来绘制一些东西。

shape 则是一个形状实例，可以通过它获取一些属性值（比如宽高值），用来计算我们要绘制的图形的各点的坐标位置。

菱形的绘制
-----

```js
function sceneFunc(ctx, shape) {
  const w = shape.getAttr('width');
  const h = shape.getAttr('height');

  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w, h / 2);
  ctx.lineTo(w / 2, h);
  ctx.lineTo(0, h / 2);
  ctx.closePath();
 
  ctx.fillStrokeShape(shape);
}
```

首先我们计算出菱形的各个端点位置，用 canvas 原生的 `ctx.moveTo` 和 `ctx.lineTo` 依次相连，然后再调用 konva 增强的 `ctx.fillStrokeShape(shape)` 方法，对路径先进行填充，再描边。

需要注意的是，x 和 y 不能参与计算，因为 konva 会做额外的位置偏移操作。如果你在这里的计算考虑了 x 和 y，就会导致实际的位置变成了预期的两倍。同样，scale 缩放值也不要参与计算。

完整的写法为：

```js
const diamond = new Konva.Shape({
  x: 200,
  y: 20,
  width: 60,
  height: 100,
  fill: '#0288d1',
  sceneFunc(ctx, shape) {
    const w = shape.getAttr('width');
    const h = shape.getAttr('height');
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w / 2, h);
    ctx.lineTo(0, h / 2);
    ctx.closePath();

    ctx.fillStrokeShape(shape);
  }
});
layer.add(diamond);
```

我们可以简单封装一下，写一个 createDiamond 方法，方便多次调用。

```js
const createDiamond = (props) => {
  return new Konva.Shape({
    ...props,
    sceneFunc(ctx, shape) {
      const w = shape.getAttr('width');
      const h = shape.getAttr('height');
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(0, h / 2);
      ctx.closePath();

      ctx.fillStrokeShape(shape);
    }
  });
};

// 用法
const diamond2 = createDiamond({
  x: 30,
  y: 30,
  width: 120,
  height: 100,
  fill: '#fff'
});
layer.add(diamond2);
```

sceneFunc 可能会在一秒内调用多次，最好不要做一些损耗性能的操作，比如创建一个很大的 image 对象。

此外，scenceFunc 应该只做和绘制相关的操作，不建议在里面做一些其他的操作，比如绑定事件。

我是前端西瓜哥，欢迎关注我，一起学习前端知识。

> 首发于我的公众号：前端西瓜哥
