# img 元素和 background-image 属性的区别

大家好，我是前端西瓜哥。今天带大家学习 img 元素和 background-image 属性的区别。

img 是 HTML 元素，基本用法如下：

```html
<img src="./img.jpg" alt="图片描述" />
```

background-image 则是一个 CSS 样式属性，用于设置元素的背景图片。

```css
.bg {
  background-image: url("./img.jpg");
}
```

img 是内容的一部分
-----------

首先 img 是 DOM 树的一部分，属于网页的**内容**。

有些客户端（比如爬虫、性能差的电子阅读器）不会解析样式或执行脚本，但包括 img 在内的 DOM 树是一定会解析的。即使客户端不解析图片，也可以获得 img 的 alt 内容，得到图片的描述。

而 background-image 则是 **装饰**，用于美化内容。

所以，如果你的图片是和正文内容有关的，建议使用 img，有利于语义化和 SEO。

二者的特性
-----

img 即使不手动设置宽高，也会自定占据空间，将其他元素挤开。

background-image 则作用在元素上，本身不能撑开元素。

background-image 可以配合背景图片相关属性，实现各种效果，比如**雪碧图**、平铺瓷砖等，这是 img 元素做不到的。

> 雪碧图（CSS sprite），指的是将多个小图标放到一个图片上。然后通过 width、height、background-position 来框选想要用的图标。

加载时机
----

**img 会比 background-image 先加载**，因为渲染过程为先解析 DOM 树，然后再应用样式树。如果 background-image 还是在一个外链的 css 文件中，加载时机会更晚。

所以 background-image 更适合作为 banner 轮播图、广告图。因为 banner 通常都是广告，可以晚点加载，不要阻塞其他内容。

此外，延后加载时机还可以使用 JS 脚本加载的方式。

打印
--

使用浏览器的打印功能。img 会被渲染，但 background-image 却会被丢弃。

如果你希望你的网页支持良好的打印效果，且图片也是必要的内容，使用 img。

右键保存
----

在浏览器中，img 元素可以点击鼠标右键的方式下载保存图片。但 background-image 不行。

你可以根据需要来决定是否提供用户右键保存的功能。

当然，并不是总能阻止，如果用户能够使用且熟悉浏览器开发者工具，他也可以找到对应资源下载。

结尾
--

img 是内容的一部分，background-image 则是装饰。他们有各自的特性，需要根据实际需求选择使用。

> 本文首发于我的公众号：前端西瓜哥
