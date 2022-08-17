# React 性能优化方法

大家好，我是前端西瓜哥。今天带大家来学习如何做 React 性能优化。

使用 React.memo()
---------------

一个组件可以通过 React.memo 方法得到一个添加了缓存功能的新组件。

```js
const Comp = props => {
  //
}

const MemorizedComp = React.memo(Comp);
```

再次渲染时，**如果 props 没有发生改变，就跳过该组件的重渲染**，以实现性能优化。

这里的 **关键在于 props 不能改变，这也是最恶心的地方**。

对于像是字符串、数值这些基本类型，对比没有问题。但对于对象类型，就要做一些缓存工作，让原本没有改变的对象或函数仍旧指向同一个内存对象。

因为每次函数组件被执行时，里面声明的函数都是一个全新的函数，和原来的函数指向不同的内存空间，全等比较结果是 false。

关于 React.memo 的具体使用，可以看看我的这篇文章：《[React.memo 如何使用？](https://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485644&idx=1&sn=d17a9eee2a0b8a79d09f64ed0033a6d6&chksm=e948cda7de3f44b1ffd3dd1946337709023303f6d435727a7b46353bec4dfc723d813b6d280d&scene=21#wechat_redirect)》

处理 props 比较问题
-------------

React.memo() 最疼痛的就是处理 props 比较问题。

我们看个例子：

```js
const MemorizedSon = React.memo(({ onClick }) => {
  // ...
})

const Parent() {
  // ...
  const onClick = useCallback(() => {
    // 一些复杂的判断和逻辑
  }, [a, setA, b, onSava]);
  return (
    <div>
      <MemorizedSon onClick={onClick} />
    </div>
  )
}
```

上面为了让函数的引用不变，使用了 useCallback。函数里用到了一些变量，因为函数组件有闭包陷阱，可能会导致指向旧状态问题，所以需要判断这些变量是否变化，来决定是否使用缓存函数。

这里就出现了一个 **连锁反应**，就是我还要给变量中的对象类型做缓存，比如这里的 setA 和 onSave 函数。然后这些函数可以又依赖其他函数，一直连锁下去，然后你发现有些函数甚至来自其他组件，通过 props 注入。

啊我真的是麻了呀，我优雅的 React 一下变得丑陋不堪。

怎么办，一个方式是用 ref。ref 没有闭包问题，且能够在组件每次更新后保持原来的指向。

```js
const MemorizedSon = React.memo(({ onClickRef }) => {
  const onClick = onClickRef.current;
})

const Parent() {
  // ...
  const onClick = () => {
    // 一些复杂的判断和逻辑
  };
  
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  
  return (
    <div>
      <MemorizedSon onClickRef={onClickRef} />
    </div>
  )
}
```

或者

```js
const MemorizedSon = React.memo(({ onClick }) => {
  // ...
})

const Parent() {
  // ...
  const onClick = useCallback(() => {
    const {a, b} = propsRef.current;
    const {setA, setSave} = stateRef.current;
    // 一些复杂的判断和逻辑
  }, []);
  return (
    <div>
      <MemorizedSon onClick={onClick} />
    </div>
  )
}
```

当然官方也注意到这种场景，提出了 useEvent 的提案，希望能尽快实装吧。

```js
function Chat() {
  const [text, setText] = useState('');

  const onClick = useEvent(() => {
    sendMessage(text);
  });
  return <SendButton onClick={onClick} />;
}
```

> The code inside `useEvent` “sees” the props/state values at the time of the call. **The returned function has a stable identity even if the props/state it references change**. There is no dependency array.

用了 useEvent 后，指向是稳定的，不需要加依赖项数组。

提案详情具体看下面这个链接：

https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md

跳过中间组件
------

假设我们的组件嵌套是这样的：A -> B -> C。

其中 C 需要拿到 A 的一个状态。B 虽然不需要用到 A 的任何状态，但为了让 C 拿到状态，所以也用 props 接收了这个，然后再传给 C。

这样的话，A 更新状态时，B 也要进行不必要的重渲染。

对于这种情况，我们可以让中间组件 B 跳过渲染：

1.  给 B 应用 React.memo，A 的状态不再传给 B；
    
2.  A 的状态通过发布订阅的方式传给 C（比如 useContext，或通过状态管理）
    

状态下放
----

假设同样还是 A -> B -> C 形式的组件嵌套。

C 需要来自 A 的状态，B 会帮忙通过 props 传递状态过来。A 状态更新时，A、B、C 都会重渲染。

如果状态只有 C 一个组件会用到，我们可以考虑直接把状态下放到 C。这样当状态更新时，就只会渲染 C。

组件提升
----

将组件提升到父组件的 props 上。

```js
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}

function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

在这里 ColorPicker 更新 color 状态后，因为 ExpensiveTree 来自外部 props，不会改变，不会重渲染。除非是 App 中发生了状态改变。

正确使用列表 key
----------

进行列表渲染时，React 会要求你给它们提供 key，让 React 识别更新后的位置变化，避免一些不必要的组件树销毁和重建工作。

比如你的第一个元素是 div，更新后发生了位置变化，第一个变成了 p。如果你不通过 key 告知新位置，React 就会将 div 下的整棵树销毁，然后构建 p 下的整棵树，非常耗费性能。

如果你提供了位置，React 就会做真实 DOM 的位置移动，然后做树的更新，而不是销毁和重建。

如果你想深入了解 key，可以看我写的这篇文章：《[React 中的列表渲染为什么要加 key ？](https://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485439&idx=1&sn=b63e7872589c5c65594b457b9a3428da&chksm=e948c294de3f4b82589882f5e7aafb08f8611c641a7134f170cddef1eb7e022e4dc7a26416e4&token=2084731007&lang=zh_CN&scene=21#wechat_redirect)》

注意状态管理库的触发更新机制
--------------

对于使用 Redux 的进行状态管理的朋友来说，我们会在函数组件中通过 useSelector 来订阅状态的变化，自动更新组件。

```js
const Comp() {
  const count = useSelector(state => state.count);
}
```

useSelector 做了什么事？它会订阅 state 的变化，当 state 变化时，会运行回调函数得到返回值，和上一次的返回值进行**全等比较**。如果相等，不更新组件；如果不等，更新组件。然后缓存这次的返回值。

上面这种情况还好，我们再看看写成对象的形式

```js
import { shallowEqual, useSelector } from 'react-redux'

const Comp() {
  const { count, username } = useSelector(state => ({
    count: state.count,
    username: state.username
  }), shallowEqual);
}
```

上面这种写法，因为默认用的是全等比较，所以每次 state 更新后比较结果都是 false，组件每次都更新。**对于组合成的对象，你要用 shallowEqual 浅比较来替代全等比较，避免不必要的更新**。

有一种情况比较特别，假设 state.userInfo 有多个属性，username、age、acount、score、level 等。有些人会这样写：

```js
const Comp() {
  const { username, age } = useSelector(state => state.userInfo), shallowEqual);
}
```

看起来没什么问题，但里面是有陷阱的：虽然我们的组件只用到 username 和 age，但 useSelector 却会对整个 userInfo 对象做比较。

假设我们只更新了 userInfo.level，useSelector 的比较结果就为 false 了，导致组件更新，即使你没有用上 level，这不是我们期望的。

所以正确的写法应该是：

```js
const Comp() {
  const { username, age } = useSelector(state => {
    const { username, age } = state.userInfo;
    return { username, age };
  }), shallowEqual);
}
```

**使用 useSelector 监听状态变化，一定要关注 state 的粒度问题**。

Context 是粗粒度的
-------------

React 提供的 Context 的粒度是粗粒度的。

当 Context 的值变化时，用到该 Context 的组件就会更新。

有个问题，就是 **我们提供的 Context 值通常都是一个对象**，比如：

```js
const App = () => {
  return (
    <EditorContext.Provider value={ visible, setVisible }>
      <Editor />
    </EditorContext.Provider>
  );
}
```

每当 Context 的 value 变化时，用到这个 Context 的组件都会被更新，即使你只是用这个 value 的其中一个属性，且它没有改变。

因为 **Context 是粗粒度的**。

所以你或许可以考虑**在高一些层级的组件去获取 Context，然后通过 props 分别注入到用到 Context 的不同部分的组件中**。

顺便一提，Context 的 value 在必要时也要做缓存，以防止组件的无意义更新。

```js
const App = () => {
  const EditorContextVal = useMemo(() => ({ visible, setVisible }), [visible, setVisible]);
  return (
    <EditorContext.Provider value={ visible, setVisible }>
      <Editor />
    </EditorContext.Provider>
  );
}
```

批量更新
----

有一个经典的问题是：React 的 setState 是同步还是异步的？

答案是副作用或合成事件响应函数内，是异步的，会批量执行。其他情况（比如 setTimeout）则会同步执行，同步的问题是会立即进行组件更新渲染，一次有多个同步 setState 就可能会有性能问题。

我们可以用 `ReactDOM.unstable_batchedUpdates` 来将本来需要同步执行的状态更新变成批量的。

```js
ReactDOM.unstable_batchedUpdates(() => {
  setScore(score + 1);
  setUserName('前端西瓜哥');
})
```

不过到了 React18 后，开启并发模式的话，就没有同步问题了，所有的 setState 都是异步的。

Redux 的话，你可以考虑使用批量更新插件：redux-batched-actions。

```js
import { batchActions } from 'redux-batched-actions';

dispatch(batchActions([
  setScoreAction(score + 1),
  setUserName('前端西瓜哥')
]));
```

redux-batched-actions 中间件确实会将多个 actions 做一个打包组合再 dispatch，你会发现 store.subscribe 的回调函数触发次数确实变少了。

但如果你用了 react-redux 库的话，这个库其实在多数情况下并没有什么用。

因为 react-redux 其实已经帮我们做了批量处理操作，同步的多个 dispatch 执行完后，才会通知组件进行重渲染。

懒加载
---

有些组件，如果可以的话，可以让组件直接不渲染，做一个懒加载。比如：

```jsx
{visible && <Model />}
```

结尾
--

React 的优化门道还是挺多的，其中的 React.memo 优化起来确实复杂，一不小心还会整成负优化。

所以，不要 **过早进行优化**。

我是前端西瓜哥，欢迎关注我，学习更多前端知识。

> 本文首发于我的个人公众号：前端西瓜哥


* * *

相关阅读，

[React.memo 如何使用？](https://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485644&idx=1&sn=d17a9eee2a0b8a79d09f64ed0033a6d6&chksm=e948cda7de3f44b1ffd3dd1946337709023303f6d435727a7b46353bec4dfc723d813b6d280d&scene=21#wechat_redirect)

[React 中的列表渲染为什么要加 key ？](https://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485439&idx=1&sn=b63e7872589c5c65594b457b9a3428da&chksm=e948c294de3f4b82589882f5e7aafb08f8611c641a7134f170cddef1eb7e022e4dc7a26416e4&token=2084731007&lang=zh_CN&scene=21#wechat_redirect)

[React 性能调试好帮手：useWhyDidYouUpdate](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485660&idx=1&sn=b7b1da81963601a6512e78a8db1ff173&chksm=e948cdb7de3f44a19bab4a92f9e4679018d396c7cc614c60eaaeee06c5e1a10ea02005d3c4b2&scene=21#wechat_redirect)

[在 React 中使用 Redux 的 4 种写法](https://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485150&idx=1&sn=04c858ff727d6b70845d79becfb1121e&chksm=e948c3b5de3f4aa39f2ad91171c0a7f96f2feb858f5a42bcc6518560d6cd7e0338bd079f78f4&scene=21#wechat_redirect)

  
