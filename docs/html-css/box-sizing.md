# 一道关于 box-sizing 的字节面试题

大家好，我是前端西瓜哥。今天讲讲我很久以前面试字节时遇到的一道 CSS 面试题。

有如下的 HTML 和 CSS 样式，问两个块橙色区域宽高分别为多少？

```html
<style>
  .box {
    width: 10px;
    height: 10px;
    border: 1px solid #000;
    padding: 2px;
    margin: 2px;
    background-color: orange;
  }

  .content-box {
    box-sizing: content-box;
  }

  .border-box {
    box-sizing: border-box;
  }
</style>
<div class="box content-box"></div>
<div class="box border-box"></div>
```

本题考查的是 CSS 盒子模型。

## CSS 盒子模型

CSS 盒子组成由 4 个区域组成，从内到外依次为：

-   Content box：内容盒子，用于显示内容（innerHTML），默认通过 width 和 height 控制宽高。但如果 box-sizing（盒模型的意思）属性设置为非 content-box 值，运用的规则会发生改变。
-   Padding box：内边距盒子，通过 padding 属性可以设置内边距大小。
-   Border box：边框盒子，通过 border 属性可以设置边框大小及样式。
-   Margin box：外边距盒子，通过 margin 属性设置外边距大小。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd08a85e12a84d789a1d61d64cc0bb29~tplv-k3u1fbpfcp-zoom-1.image)

需要注意的是，**margin 不计入盒子的实际大小**。比如盒子的背景色不会覆盖到 margin 的范围。你可以把 margin 当作多个盒子之间的空气墙，是用来控制盒子间的距离的。

我们可以通过 box-sizing 来控制 width 和 height 被应用到哪个盒子上，下面具体展开来说一说。

## 标准盒模型（content-box）

对于现代浏览器来说，元素默认应用标准盒模型。当然你也可以像下面这样做显式的设置。

```css
.box {
  box-sizing: content-box;
}
```

**标准盒模型中，width 和 height 属性用于设置 Content box 盒子**。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ddde19fb80d4d04a75ec2ebb9822b82~tplv-k3u1fbpfcp-zoom-1.image)

我们回到题目，先看看第一个橙色块的宽高。

```css
.box {
  width: 10px;
  height: 10px;
  border: 1px solid #000;
  padding: 2px;
  margin: 2px;
  background-color: orange;
}
.content-box {
  box-sizing: content-box;
}
```

```html
<div class="box content-box"></div>
```

content 的宽度为 10px。

padding 为 2px，这个 padding 是 padding-left、padding-right、padding-bottom、padding-left 的简写属性。盒子的宽需要将 padding-left 和 padding-right 都计算在内。

然后是左右两个 border 条。margin 不计算在盒模型中。

所以对于盒模型来说，宽度就是 16px（10 + 2 * 2 + 1 * 2），高度同理，也是 16px。

这个就是答案了吗？

并不是，因为我们要找到的橙色块的宽高，其实就是 Padding box 的宽高，这个块并不包括黑色的 border 边框线。所以我们的第一个橙色块宽高为 14px。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/492c46e9ffe34a238f052d3875cb1ef0~tplv-k3u1fbpfcp-zoom-1.image)

我们再深挖一下，如果我们给 border 颜色设置为透明，比如 `border: 1px solid rgb(0, 0, 0, 0)`，你觉得橙色块宽高为多少？

答案是 16px。**背景色会先填充整个盒子，然后再在其上添加 border**。如果 border 变成透明了，就会将它原本覆盖的部分橙色区域显现出来。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/808e4e2603434556969c24c06fa2d1c6~tplv-k3u1fbpfcp-zoom-1.image)

## 怪异盒模型（border-box）

怪异盒模型，也叫 IE 模型。

IE 浏览器的早期版本没有遵循 CSS 标准，width 和 height 是用来设置 Border box 的宽高，而不是 Content box 的宽高，导致不同浏览器的表现不同，毫无疑问是个浏览器 bug。

后来 CSS3 引入了 box-sizing，让开发者可以选择使用哪种盒模型，提供更好的灵活性。通过下面的设置，我们可以将元素的盒模型设置为怪异盒模型。

```css
.box {
  box-sizing: border-box;
}
```

**怪异盒模型中，width 和 height 属性用于设置 Border box 盒子**。即我们直接给元素对应的盒子设置了宽高，再通过 padding 和 border，才能计算出 Content box。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00453503f1fc435399c2768b2b2a0f44~tplv-k3u1fbpfcp-zoom-1.image)

我们看看题目中第二个橙色块的宽高如何计算。

```css
.box {
  width: 10px;
  height: 10px;
  border: 1px solid #000;
  padding: 2px;
  margin: 2px;
  background-color: orange;
}
.border-box {
  box-sizing: border-box;
}
```

```html
<div class="box border-box">
```

盒模型宽为 10px，减去 border 的 2px（左右两条 1px 的边框线），计算出来的就是 Border box 盒子的宽度 8px。高度计算同理。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ffb54dda158d450fafbd6df7b588c4fa~tplv-k3u1fbpfcp-zoom-1.image)

所以本题的答案是：第一个橙色块的宽高为 14px，第二个橙色块的宽高为 8px。

## 结尾

对于 DOM 元素来说，我们有两种盒模型：

1.  `box-sizing: content-box`：width 和 height 对 Content box 生效的标准盒模型，是默认的盒模型；
1.  `box-sizing: border-box`：width 和 height 对 Border box 生效的怪异盒模型。

另外，box-sizing 仅支持上面两种值，是没有 padding-box 这种盒模型的，不要想太多。

我是前端西瓜哥，一名喜欢分享前端技术的程序员，欢迎关注我的公众号「前端西瓜哥」。