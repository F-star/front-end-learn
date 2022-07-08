# React 中的列表渲染为什么要加 key ？

大家好，我是前端西瓜哥，今天来学习 React 中的列表渲染要加 key 的原因。

在 React 中我们经常需要渲染列表，比如展示好友列表。

常用写法是用 Arrary.prototype.map 方法，将数组形式的数据映射为 JSX.Element 数组，并嵌入到组件要返回的 JSX.Element 中，如下：

```jsx
function FriendList() {
  const [items, setItems] = useState(['前端西瓜哥', '小明', '张三']);

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

你需要给每个项提供 key 属性作为标识，以区分不同的项。如果你不加 key，React 会警告你：

```
Warning: Each child in a list should have a unique "key" prop.
```

为什么需要 key？
----------

在回答这个问题之前，我们先简单了解一下 React 的 DOM Diff 算法原理。

React 会在状态发生变化时，对真实 DOM 树按需批量更新，产生新的 UI。

为此底层做的工作是：将新旧两棵虚拟 DOM 树进行 diff 对比，计算出 patch 补丁，打到真实 DOM 树上。

为了高效，React 的 diff 算法做了限制：

1.  只做同层级的节点对比，不跨层级比较；
    
2.  如果元素的类型不同（如从 p 变成 div），那它们就是不相同的，会销毁整个旧子树，并调用其下组件的卸载钩子，然后再创建全新的树，相当消耗性能。
    
3.  如果类型相同，会进行打补丁操作（如更新 className 和标签下的文本内容）
    

但这样做会有一个问题，如果同级的多节点 **只是位置发生了变化**，但因为相同索引位置对不上，又发现不能复用，就要销毁一棵树并创建一棵新树，实在是太过于低效了。

于是 React 给开发者提供 key 来标记节点，来优化 React diff 算法，告知 React 某个节点其实没有被移除或不能被原地复用，只是换了位置而已，让 React 更新一下位置。

列表渲染不提供 key 会怎样？
----------------

不提供 key，React 就无法确定某个节点是否移动了。

React 就只会对比相同位置的两个节点，如果它们类型相同（比如都是 li 元素），就会对比 props 的不同，进行 props 的打补丁。

因为 **列表渲染通常都是相同的类型**，所以位置变动时，多半是会触发节点原地复用效果，倒是不用担心树的销毁重建发生。

原地复用在不提供 key 的时候有时候也是能正确渲染的。

除了一种情况，就是 **这个节点有自己的内部状态**，最经典的莫过于输入框。

```jsx
function FriendList() {
  const [items, setItems] = useState(['前端西瓜哥', '小明', '张三']);
  const swap = () => {
    [items[0], items[1]] = [items[1], items[0]];
    setItems([...items]);
  };

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li>{item}<input /></li>
        ))}
      </ul>
      <button onClick={() => { swap(); }}>
        交换
      </button>
    </div>
  );
}
```

我们给第一和第二个输入框输入内容。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1503d86c4edb400aa2824f75f5475271~tplv-k3u1fbpfcp-zoom-1.image)

再点击 “交换” 按钮，交换数组第一和第二个元素位置。

然后我们看到 input 前面的文字正确交换了，但是输入框里的内容却没有交换。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6523a5127cc4739ae95da848e146280~tplv-k3u1fbpfcp-zoom-1.image)

**原因是 React 做了原地复用，而 input 没有传 props，不需要打 props 补丁，保持了原样**。

这个问题怎么解决？加 key。让 React 知道你的节点需要移动，你得这样写：

```jsx
items.map((item) => (
  <li key={item}>{item}<input /></li>
))
```

不使用 key 的另一个缺点是：因为原地复用会使传入的 props 发生变化，导致不能利用好 React.memo 的组件缓存能力。

列表渲染的 key 用数组索引会怎样？
-------------------

效果和不使用 key 相同，依旧是新旧节点的相同索引位置对比，但是控制台不会打印警告。

应该用什么值作为 key？
-------------

对于节点，你需要用一个唯一的 id 赋值给 key，通常会是数组的 id，比如后端返回的好友列表的好友 id。

```jsx
const [items, setItems] = useState([
  { id: 5, name: '前端西瓜哥' },
  { id: 9, name: '小明' },
  { id: 87, name: '张三' },
  { id: 91, name: '前端西瓜哥' }
]);

const list = items.map((item) => (
  <li key={item.id}>{item.name}</li>
));
```

如果后端没有返回 id，你可以自己手动用一个 id 生成器补上一个 id，虽然不太优雅就是了。比如：

```js
const items = ['前端西瓜哥', '张三'];

const genId = (() => {
  let i = 0;
  return () => {
    return i++;
  }
})();

const itemsWithId = items.map(item => ({ id: genId(), val: item }));
// [{id: 0, val: '前端西瓜哥'}, {id: 1, val: '张三'}]
```

对了，这个 key 只需要在同一个层级的节点唯一即可，不要求所有层级的 key 都是唯一的。

另外，如果你确保你的列表渲染后直到被销毁，不会有位置上的变化，可以使用数组索引为 key。

结尾
--

对于列表的渲染，我们有必要提供 key，来对节点进行区分，React 的 DOM Diff 算法会基于 key 进行节点位置的调整，确保一些涉及到内部状态的节点的渲染状态。

通常来说，key 值应该是唯一的，通常来自后端返回的数据。在你确认列表不会发生位置变更时，可以使用数组索引作为 key，以去掉恼人的警告提示。

有一个点需要说明的是，key 并不是列表渲染的专属，普通的节点也可以用 key。

我是前端西瓜哥，欢迎关注我，一起学前端。

* * *

  

相关阅读，

[React 16 升级到 17 的一个坑：组件销毁时 ref 可能会被重置为 null](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485233&idx=1&sn=557b4197385df43c1aa4751f4c75ebdd&chksm=e948c25ade3f4b4c2388483deaa5117ddbb37223467d03bdcab33826e67f1f3ed03512e6bb7e&scene=21#wechat_redirect)  

[学习 React.js 需要了解的一些概念](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485182&idx=1&sn=46d05d5bbc7192ab46464f7aec626172&chksm=e948c395de3f4a8311224a8c12757c69f1c51b110f43b3e448145754b6572638dcdf91266506&scene=21#wechat_redirect)  

[在 React 中使用 Redux 的 4 种写法](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485150&idx=1&sn=04c858ff727d6b70845d79becfb1121e&chksm=e948c3b5de3f4aa39f2ad91171c0a7f96f2feb858f5a42bcc6518560d6cd7e0338bd079f78f4&scene=21#wechat_redirect)  

> 本文首发于我的公众号：前端西瓜哥