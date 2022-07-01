# 管理好资源的加载，你需要了解的 preload、prefetch、preconnect 以及 dns-prefetch

`<link>` 是一种 HTML 标签，用于加载外部资源。

最常见的用法，就是加载 CSS 样式文件，写法如下：

```html
<link rel="stylesheet" href="./index.css">
```

rel 属性是 “关系” 的意思，它的值 `stylesheet` 表示使用的是样式表。

href 表示资源的地址，当前 HTML 文件通过这个地址来加载内容。

但 link 的功能不仅限于此，它也可以控制资源的下载优先级、提前和指定域名进行连接。

## preload

```html
<link rel="preload" href="./main.css" as="style">
```

preload，预先加载。作用是将对应资源的下载优先级提升为最高。

preload 负责的是提高下载优先级，并将其下载好，但不负责将资源嵌入到页面，你需要自己找到合适的地方将其显式嵌入。

同时 preload 也不影响资源的执行顺序。

如果有多个资源资源都用了 preload，谁先设置 preload 谁就先下载。

as 属性是必填的，不同类型文件对应的值也不同，比如 css 文件的 as 值为 style。

场景有：

- 有字体的 CSS 先加载，防止字体突然的变化。
- 按需加载语言包的语言包 js 文件最先加载。

## prefetch

```html
<link rel="prefetch" href="lib/jquery.min.js" as="script">
```

prefetch，先抓在手上不用，等下一个页面再用。

对于设置了 prefetch 的资源，浏览器会认为这个资源目前不会用到，但可能下个页面会用到，于是会将对应资源的下载优先级降为最低（Lowest）。

在其他资源加载好了之后，下载队列空闲了，该资源才被下载缓存起来。

进入的下一个页面如果使用了这个资源，你会在开发者工具的 network 面板看到 `prefetch cache`。


![image-20220228230301308.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7e500bd8daa498c9df4d2ff93d39669~tplv-k3u1fbpfcp-watermark.image?)

场景有：

- 工具类官网首页介绍工具用法时，偷偷加载好真正的工具页面需要的一些资源，等用户点进去。提高进入工具页面的加载速度，改善用户体验。

## preconnect

```html
<link rel="preconnect" href="https://cdn-s1.somecdnsite.com">
```

preconnect 的作用是提前和目标服务器进行连接。

这个连接过程包括（1）DNS 查询得到 IP，（2）TCP 三次握手，（3）HTTP 或 HTTPS 连接。

还是挺繁琐的，我们可以提前做这个连接操作，节省个一两百毫秒还是挺不错的。感觉网络不好或者波动的时候效果可能会更好些。


![image-20220228231319792.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb11683ccf4c4fb9a4cc20ca33f39fbf~tplv-k3u1fbpfcp-watermark.image?)

场景有：

- 常用的 cdn 资源所在的域名先连接好
- 视频不播放，在用户点击播放前，我们先连上对应域名

## dns-prefetch

```html
<link rel="dns-prefetch" href="https://cdn-s1.somecdnsite.com">
```

dns-prefetch，则是预先通过 DNS 查询得到指定域名对应的 IP，在真正请求该域名下资源时，可以省掉 DNS 查询这一步。

preconnect 的更细粒度版本。

preconnect 用多了也不好，可能反而会堵塞正常的请求，可以配合适量的 dns-prefetch，减少时间花费。

场景同 preconnect。

## 结尾

我们总结下：

- preload：提高资源加载优先级。适用于提前加载字体，加载语言包等场景，
- prefetch：降低资源加载优先级，在下载闲置时再下载缓存起来。适用于提高下一个页面使用该资源缓存以提高加载速度的场景。
- preconnect：预先和目标域名进行连接，包括 DNS 查询、TCP、HTTP(S) 连接。
- dns-prefetch：预先查询好目标域名的 IP。

> 文章首发于我的公众号：前端西瓜哥
