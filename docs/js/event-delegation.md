# JS 中的事件委托是什么？

大家好，我是前端西瓜哥。今天我们来认识一下事件委托。

所谓事件委托，就是将原本应该在当前元素绑定的事件，放到它的祖先元素上，让祖先元素来委托处理。

事件流
---

事件流指从页面中接收事件的顺序，也可理解为事件在页面中传播的顺序。

事件流由两阶段组成：

1.  捕获事件
    
2.  冒泡事件
    

我们通常用 `addEventListener` 给元素添加事件：

```js
document.querySelector('#card')addEventListener(
  'click',
  function (event) {
   console.log('div#card 冒泡点击', event);
 },
  false
);
```

第一个参数是事件名，第二个参数是事件响应函数，可以拿到当前的事件对象。

第三个参数是可选的，表示监听的是否为捕获阶段，false为冒泡阶段，也是默认值，true 为捕获阶段。我们常用的是冒泡阶段。

当我们点击元素时，就会执行这个函数。

假设我们的 DOM 结构如下：

```html
<html>
  <head>
    <title>前端西瓜哥</title>
    <meta charset="UTF-8" />
  </head>

  <body>
    <div id="app">
      <div id="box-1">
        <div id="card">card</div>
      </div>
      <div id="box-2"></div>
    </div>
  </body>
</html>
```

现在我们点击 card 文字时，DOM 就会产生事件流。

事件流首先会进入 **捕获阶段**，从根节点往目标元素（`div#card`）移动，依次经过为：

*   window
    
*   document（文档根元素，在 HTML 中没有显式声明）
    
*   document.documentElement（`<html>` ）
    
*   document.body（`<body>`）
    
*   ...
    
*   目标元素 `div#card`
    

和调用事件对象的 event.composedPath() 方法拿到的 **事件路径** 类似。

![7LIjmk](https://fe-watermelon.oss-cn-shenzhen.aliyuncs.com/7LIjmk.jpg)

> window 看起来是个全局变量，但它也是可以绑定事件的，比如窗口大小改变的 resize 事件就只能绑定到 window 上，而不能绑定到 document 上。

然后再执行 **冒泡阶段**，然后反着再经过一遍这些节点。

![tSz3Ba](https://fe-watermelon.oss-cn-shenzhen.aliyuncs.com/tSz3Ba.jpg)

我们会根据事件流经过的顺序，依次执行这些节点上绑定的对应事件函数。

事件委托
----

假如我有一个好友列表，我希望点击 “聊天” 按钮，拿到对应用户 id，创建并进入到对应用户的聊天会话中。

```html
<ul>
  <li>前端西瓜哥<button>聊天</button></li>
  <li>fe_watermelon<button>聊天</button></li>
  <!-- ... -->
  <li>老王<button>聊天</button></li>
</ul>
```

最直接的方式是给所有的 button 元素都绑定各自的事件。

节点少的时候还好，**如果节点多达上千上万个，就需要声明相当多的事件函数，比较消耗内存**。而且 **如果列表经常发生动态变更，也会导致大量事件监听的移除和绑定**。

在这种情况下，事件委托就大有可为了。

**事件委托正是利用事件流的冒泡特性，将本来要绑定到多个元素的事件函数，委托到了其祖先元素上**。

在上面这个例子中，我们可以将事件绑定到 ul 节点上，执行函数时，通过 event 对象拿到必要的信息，进行统一的操作。

```js
document.querySelector('ul').addEventListener('click', (event) => {
  const target = event.target;
  const userId = target.getAttribute('data-user-id');
  if (userId) {
    joinChat(userId);
  }
});
```

通过 `event.target` 我们能获得这次事件流的目标节点，然后从该节点对象中提取出需要的信息。

在这里我们需要拿到用户 id，所以需要给 button 元素添加类似 `data-user-id` 的自定义属性，像这样子：

```html
<ul>
  <li>前端西瓜哥<button data-user-id="5">聊天</button></li>
  <li>fe_watermelon<button data-user-id="99">聊天</button></li>
  <!-- ... -->
  <li>老王<button data-user-id="63">聊天</button></li>
</ul>
```

这样，不管 li 有多少，更新多频繁，我们只需要维护一个函数就够了。

结尾
--

事件委托，其实就是将原本应该绑定在子元素的的大量类似的事件监听函数，改为绑定到父元素或祖先元素上，委托祖先元素来处理。

不过在实际开发中，需要用到事件为委托的场景还是比较少，因为我们的列表通常不会太长。

我是前端西瓜哥，持续更新原创前端技术文章，欢迎关注我。

> 本文首发于我的公众号：前端西瓜哥