
# JS 中的 Event Loop 是什么？

大家好，我是前端西瓜哥，今天来认识一下什么是 Event Loop。

Event Loop，简单翻译就是 **事件循环**，是 JS 语言下实现运行时的一个机制。

JS 的异步并不像其他语言（比如 Java）的异步那样可以实现真正的并发执行，本身其实是个单线程。

JS 是维护了一个 **任务队列**，每当要执行一些异步任务，比如定时器或者是点击按钮触发的事件响应函数。它们不会立即执行，而是放到这个队列里，等待已经在排队的其他任务先执行完，才轮到它们。

> 队列是一个操作受限的有序列表，表现为为先进入的元素必须先出去，即 “先进先出”，很像排队的感觉。
> 
> 不过也有一些特殊的队列，比如优先级队列，它是优先级高的元素先出队。

之所以叫 Event Loop，因为它的逻辑可以描述为下面代码：

```js
while (queue.waitForMessage()) {
  queue.processNextMessage();
}
```

当一个任务被完成后，队列会变成等待下一个任务状态，然后处理下一个任务，如此循环往复。

因为 JS 的代码执行本身是一个单线程，为了不让执行阻塞，JS 会把网络请求操作、渲染浏览器页面等操作，交给其他的线程，等待其他线程处理好把结果返回给 JS。

所以 JS 不合适 CPU 密集型，更适合 IO 密集型的场景。因为它只有一个线程，如果计算耗时太长，就会阻塞其他要执行的任务，导致卡顿，甚至崩溃。

setTimeout 定时器并不准
-----------------

setTimeout 在特定时间后要执行的函数，并不会立即执行，而是会先放到任务队列中，先等待前面的任务同步执行完成了，才能执行我们这个。

下面看一个例子，因为第一个 setTimout 有一个非常耗时的同步任务，导致下一个 setTimeout 的执行阻塞，比前面一个 setTimeout 执行要慢半秒。

```js
const start = new Date().getTime();

setTimeout(() => {
  console.log('1:', new Date().getTime() - start);
  let num = 0;
  for (let i = 0; i < 999999999; i++) {
    num = i;
  }
}, 1000);

setTimeout(() => {
  console.log('2:', new Date().getTime() - start);
}, 1000);

/**
 * 输出结果：
 * 1: 1001
 * 2: 1505
 */
```

**定时器的时间，指的是能执行的最早时间**，不能保证一定能在这个时间点立即执行。

宏任务和微任务
-------

任务队列并不是严格意义上的先进先出的正常队列，是可以调整执行顺序的。

我们将要执行的任务分为宏任务和微任务，其中宏任务是正常的先进先出，而微任务则是可以插队，优先于宏任务先执行。宏任务必须在所有微任务执行后才能执行。

当我们给任务队列添加一个微任务时，它会跑到任务队列宏任务前。多个微任务入队时，会保持它们的相对顺序。

宏任务有：

*   script，即 HTML 嵌入的脚本；
    
*   setTimeout / setInterval 定时器；
    
*   setImmediate，这是 nodejs 特有的 API；
    
*   requestAnimationFrame，会在页面重绘前执行；
    
*   I/O 操作，比如网络请求完成的回调函数执行任务、还比如点击按钮要执行的回调等。这些操作其实是其他的线程完成后触发的，暂且归纳为 I/O 操作。
    

微任务有：

*   Promise 从 pending 状态转换为其他状态时，触发 then/catch/finaly 中的函数，比如 `Promise.resolve().then(fn)`。这是最常见的微任务。
    
*   MutationObserver，用于监听 DOM 的变化
    
*   process.nextTick，nodejs 特有的 API
    

任务队列，理论上一个就够了，但也可以是多个队列的组合，没有强行要求。

多个任务队列的实现可以更好地实现优先级的控制，比如对于定时器任务，理论上应该是在多个宏任务中最先执行比较好。浏览器没考虑这种情况，但 nodejs 给宏任务中也设置优先级，会让给让定时器任务最先执行。

Event Loop 还是挺复杂的，标准文档也比较长，我也没怎么看，感兴趣可以看看。

[https://html.spec.whatwg.org/multipage/webappapis.html#event-loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

一道经典异步题
-------

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function() {
  console.log("setTimeout");
}, 0);

async1();

new Promise(function(resolve) {
  console.log("promise1");
  resolve();
}).then(function() {
  console.log("promise2");
});
console.log('script end')
```

解题思路为：

*   找到同步代码。同步代码有：普通同步代码、new Promise(fn) 执行传入的回调函数、async 执行时遇到 await 的前面部分（包括 **await 的右侧函数执行也是同步的，这里是易错点**）。
    
*   看看任务队列中有哪些微任务和宏任务，记住微任务全执行完了才会执行宏任务。
    
*   执行任务，任务里面的异步任务又按顺序进入到到任务队列。
    

结果是：

```
// 同步代码
script start
async1 start
async2
promise1
script end

// 微任务
async1 end
promise2

// 宏任务
setTimeout
```

结尾
--

JS 运行机制是单线程，当有多个异步任务要同时执行，并不能并发执行，必须让优先级高的任务执行完才能执行后面的。如果正在执行的任务比较耗时，会导致后面的任务被阻塞。

Event Loop 的机制中，最基本的一条就是：**微任务比宏任务先执行**。

我是前端西瓜哥，欢迎关注我，一起学习前端技术。

> 本文首发于我的个人公众号：前端西瓜哥