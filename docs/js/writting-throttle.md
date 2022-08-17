# 手写节流（throttle）函数

大家好，我是前端西瓜哥，今天带大家来手写（throttle）节流函数。

在这之前，我们简单了解下节流函数是什么。

节流函数是什么？
--------

**节流函数，就是降低一个函数的执行频率。每隔一段时间，才执行一次函数**。

假设我们 1s 中执行了 8 次函数：

```
1  2 3 4  5    6 78  
---------------------
```

添加节流能力后，我们让函数只在特定的时间间隔执行，且其中的一部分函数并没有被真正调用：

```
// 节流后
1    3    5    6    8
---------------------
```

节流函数的常见使用场景
-----------

使用节流的场景通常为一些会高频触发的事件，包括滚动、改变窗口大小、输入内容、光标移动事件等。

它们的触发频率非常高，不进行限制的话很容易产生一些性能问题。

下面是一些常见的使用节流函数的场景：

1.  搜索框根据用户输入的内容，进行智能补全提示。需要通过节流来减少对服务器的压力
    
2.  网页底部滚动加载。如果不使用节流，用户滚动到底部时发送第一个请求时，数据还没返回，就会持续触发滚动到底部的事件，导致同一时间发送大量请求。我们可以考虑加上节流，这个时间间隔也记得调大一点，处理弱网环境。
    
3.  通过 JS 监听窗口大小改变 resize 事件，改变某个元素的宽度，可以通过节流来减少浏览器的重绘操作。
    

实现
--

我们需要实现一个 throttle 函数，这个函数接受原函数 fn 和时间间隔 wait，然后返回一个支持节流的新函数。

用法如下：

```js
const printNum = (num) => {
  console.log(num);
}

// 设置
const throttled = throttle(printNum, 300);

throttled(0);
setTimeout(() => { throttled(1); }, 100);
setTimeout(() => { throttled(2); }, 200);
setTimeout(() => { throttled(3); }, 250);

// 0
// 3 （300ms+ 左右后输出）
```

实现上，只要做到将高频的函数连续调用，变成均匀且低频的调用，就算是节流函数了。

实现的核心在于 **利用时间戳控制好定时器的调用时机**。

我们先看代码实现：

```js
function throttle(fn, wait = 0) {
  let timerId;
  let lastInvoke = Number.MIN_SAFE_INTEGER; // 上次调用时间

  return function(...args) {
    // 当前时间
    const currTime = new Date().getTime();
    // 距离下次执行的剩余时间
    const remain = Math.max(lastInvoke + wait - currTime, 0);
    // 更新定时器，确保同一时间只有一个定时器在运行
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      lastInvoke = new Date().getTime();
      fn(...args);
    }, remain);
  }
}

// 使用方式
const throttled = throttle(printNum, 300);
throttled(0);
```

演示 demo：

https://codepen.io/F-star/pen/GRxvRRd?editors=0010

首先我们需要通过闭包保存一些私有变量：

1.  原函数最后一次被调用的时间戳 lastInvoke；
    
2.  定时器 id，当函数被调用时，清除原来的定时器，再执行一个新的定时器，**确保任何时刻只有一个定时器在运行**；
    
3.  要被调用的原函数 fn；
    
4.  调用的时间间隔 wait
    

当调用 throttle 返回的增强的函数时，

先计算调用下一个函数的剩余时间 remain：首先通过 `lastInvoke + wait` 计算出下一次应该执行的时间戳，然后用这个时间戳减去当前时间戳 currTime，就能得到剩余时间了。

剩余时间可能是负数，比如我们调用 throttled 后过了很长时间再次执行的场景。这种情况下我们就将其设置为 0，接着将这个剩余时间传到 setTimeout 里执行。

定时器执行时，我们在执行原函数前，先更新 lastInvoke。如果放后面，可能会因为原函数执行报错，导致 lastInvoke 更新失败。

**以上代码的实现其实是比较粗糙的，有一些 case 没能处理到**。

如果你想要实现一个比较完美节流函数，可以参考 lodash.throttle 的实现，它考虑了更多的边界情况，并提供了一些额外功能，代码实现也较为复杂。

lodash.throttle 考虑了以下细节：

1.  第一次执行时，使用同步方式执行；
    
2.  支持中途取消执行（cancel）；
    
3.  支持中途立即执行（flush）；
    
4.  返回上一次原函数执行时的返回值；
    
5.  可以选择是否执行一轮的 leading 和 trailing 边界情况；
    
6.  ...
    

结尾
--

实现一个简单的节流函数，关键在于维护好最后一次调用原函数的时间戳，通过它来计算下一次执行时机，并使用定时器来执行。

一个比较完善的节流函数的实现并不简单，需要考虑一些边界情况，我更推荐你使用知名 lodash 工具库提供的 throttle 方法。

我是前端西瓜哥，欢迎关注我，学习更多前端面试题。

* * *


相关阅读，

- [前端面试题：手写 bind](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485521&idx=1&sn=1137da992c21b5efb04b7d1bfd1480e7&chksm=e948cd3ade3f442c4f8904cdd7f079c4eb708d270d4f94cd5ac0ef2128670e98e10072a8ff64&scene=21#wechat_redirect)  
- [前端面试题：手写 call](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485588&idx=1&sn=38cf3272b61ff966ef6c935622619299&chksm=e948cdffde3f44e95e63320818063ef096ca7e6b93db711e346e73c9faa3cbde6124700f910d&scene=21#wechat_redirect)  
- [JS 中的事件委托是什么？](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485609&idx=1&sn=1f7e1e10e27b15c105c4926b7a945be1&chksm=e948cdc2de3f44d4ab598735b738e14199f724c762b44ae7610bd0db941203c97165f7b01fc3&scene=21#wechat_redirect)  
- [JS 中的 Event Loop 是什么？](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485302&idx=1&sn=b9f1a3632f8155f3626dc39e2e44a445&chksm=e948c21dde3f4b0b3625ea1250ba54e20c9b191c26e38d3a89132e3c6a2d2a62f265f46bee22&scene=21#wechat_redirect)
