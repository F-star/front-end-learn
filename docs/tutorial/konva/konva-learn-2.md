
# 二、绘制图形

大家好，我是前端西瓜哥，今天继续学习 konva。

konva 库为我们提供了很多基础的图形，我们来看看具体都有哪些。

绘制矩形（Rect）
----------

```js {12-19}
// 舞台对象，会找到对应元素，在其下创建 canvas 元素
const stage = new Konva.Stage({
  container: '#container', // id of container <div>
  width: 300,
  height: 300
});

// 图层对象，图形对象必须放在图层对象下
const layer = new Konva.Layer();

// 绘制矩形
const rect = new Konva.Rect({
  x: 0,
  y: 0,
  width: 300,
  height: 300,
  fill: '#ff5645',
  stroke: '#000'
});

// 添加矩形到图层下
layer.add(rect);
// 添加图层到舞台下
stage.add(layer);

```

我们用 Konva.Rect 构造函数来创建矩形对象。

通过 x 和 y 设置矩形左上角坐标位置，比你高通过 width 和 height 设置矩形尺寸。

fill 用于设置填充的颜色，stroke 则是描边颜色。如果不提供 fill 或 stroke，就会填充颜色或进行描边绘制。

绘制圆形（Circle）
------------

```js
const circle = new Konva.Circle({
  x: stage.width() / 2,
  y: stage.height() / 2,
  radius: 40,
  fill: 'red',
})
layer.add(circle);
```

同样，我们用 Konva.Circle 创建圆形对象。

传入的配置项中，x 和 y 表示圆形位置，而不是左上角的位置。radius 则为圆形半径。

这里我们用调用 stage 对象的 width() 和 height() 方法拿到画布的宽高，让圆心位于在画布中央。

绘制椭圆（Ellipse）
-------------

```js
const ellipse = new Konva.Ellipse({
  x: 100,
  y: 100,
  radius: {
    x: 70,
    y: 40,
  },
  // 或者：
  // radiusX: 70,
  // radiusY: 40,
  fill: '#888'
});
layer.add(ellipse);
```

x 和 y 设置圆心位置。radius 对象的 x 和 y 属性设置椭圆的 x 轴半径和 y 轴半径。

绘制线条（Line）
----------

```js
const line = new Konva.Line({
  points: [20, 20, 100, 50, 108, 90],
  stroke: 'blue',
  strokeWidth: 8,
  lineCap: 'round',
  lineJoin: 'round',
  // closed: true,
  // tension: 0.3
});
layer.add(line);
```

points 为一系列的点的 x 和 y 坐标，它们会按数组顺序依次连接。

stroke 设置描边颜色，strokeWidth 设置描边线宽，lineCap 为线条两端的样式，这里的 'round' 表示圆滑效果。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e69c7108f2514d25802abe2dabfb2e44~tplv-k3u1fbpfcp-zoom-1.image)

lineJoin 为两条线连接点的过渡样式。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3af7fbbaa78c44fd8a0daf7e2e5bff2f~tplv-k3u1fbpfcp-zoom-1.image)

我们也可以通过头尾相连，来绘制一个不规则多边形，只需要加一个 `closed: true` 配置即可。

此外我们可以通过 tension 属性，设置一个光滑数值（比如 `tension: 1`），让线条光滑化。

绘制图片（Image）
-----------

```js
const originImg = new Image();
originImg.src = './fe_watermelon.png';
originImg.onload = () => {
  // 绘制图片
  const img = new Konva.Image({
    x: 30,
    y: 30, 
    image: originImg
  });
  layer.add(img);
};
```

一般来说，图片最好在加载完成后再绘制到 canvas 上，所以通常会配合 onload。

如果用 canvas 原生的 drawImage，如果你在图片加载完成前去执行绘制操作，会导致绘制失败。

konva 对这种情况做了优化，可以不用 onload，即使你传入一个没有加载完成的图片，它也会等待它加载完再绘制出来，并且保持它在原来的图形树结构位置。

img.onload 的写法有点繁琐，可以用 konva 的另一种写法：

```js
Konva.Image.fromURL(
  './fe_watermelon.png',
  (img) => {
    // 这里的 img 是 Konva.Image 实例
    img.setAttrs({
      x: 10,
      y: 10
    });
    layer.add(img);
  }
);
```

> 请注意 canvas 绘制图片的 **跨域问题**。

绘制文字（Text）
----------

```js
const text = new Konva.Text({
  x: 0,
  y: 0,
  fontSize: 18,
  text: '前端 西瓜哥,前端西瓜哥',
  width: 110,
  align: 'center',
  fontFamily: 'Songti SC' // 宋体
});
layer.add(text);
```

相比 canvas 的原生 API，konva 的文字绘制还支持设置容器宽度（width），当内容超过宽度时，会自动换行，还可以通过设置 `align: 'center'` 来实现居中对齐。

绘制路径（Path）
----------

```js
const path = new Konva.Path({
  x: 30,
  y: 100,
  data: 'M 0 0 L 50 50 C 90 80 60 50 60 10 Z',
  stroke: 'pink'
})
layer.add(path);
```

通过 data 来描述路径的形状。这个 data 其实就是 SVG 的 path 元素的 d 属性值，通过一些单字母命令和数字，描述各种绘制命令。

比如 M 表示移动到某个点、C 表示三阶贝塞尔曲线、Z 表示将路径的首位闭合等等。具体可以看 SVG 相关文档。

其他
--

除了这些常用的，konva 还提供一些用得比较少的形状：

*   锲形（Wedge），或者说是扇形；
    
*   文字路径（TextPath），Text 和 Path 的组合，让文字可以在路径上排布；
    
*   精灵（Sprite），其实就是通过在一些用户操作，让元素每帧显示不同的图片，比如人物行走，常见于游戏领域；
    
*   星星（Star），绘制正 N 角星；
    
*   圆环（Ring），就是中间被开了一个圆洞的圆形；
    
*   圆弧（Arc），圆环的基础上再切割一下；
    
*   标签（Label）；
    
*   正多边形（RegularPolygon）；
    
*   箭头（Arrow）。
    

此外，我们还可以定义自己的形状，具体我们下一篇文章再讲。

我是前端西瓜哥，欢迎关注我，一起学习前端知识。

> 本文首发于我的公众号：前端西瓜哥