# JS 的异步遍历，你真的会写吗？

我们有时候需要遍历数组的元素，将它们传入到异步函数中执行，其中的异步写法容易写错，我们来看一下有哪些易错点。

假设我们有个异步方法 sleepPromise，形式如下：

```js
function sleepPromise(msg, t) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`promise-${msg} ${t}s`);
    }, t * 1000);
  })
}
```

这里为了方便演示，使用 setTimeout 写成了个 promise 形式的 sleep 方法。传入的 t 为延迟执行的时间，msg 为信息内容。

在实际开发中，异步方法可能是传入用户好友 id 查找数据库，获得简单的好友信息。

假设我们需要在下面代码的注释位置下方写一个异步便利实现。

```js
async function loopAsync() {
  console.log('[start]');
  const curTime = Date.now();

  const tasks = [
    ['a', 3],
    ['b', 1],
    ['c', 2],
  ];
  
  // 下面写遍历 tasks 传入到异步方法的实现

  console.log(`[end] duration ${((Date.now() - curTime) / 1000).toFixed(2)}s`);
}
```

## 错误写法：forEach

通常前端一看到要遍历数组，就会用 forEach。如果你不够老道，可能会写出如下的实现：

```js
// 错误的 forEach 写法
tasks.forEach(async task => {
  const [ msg, t ] = task;
  const m = await sleepPromise(msg, t);
  console.log(m);
})
```

输出结果为；

```
[start]
[end] duration 0.00s
promise-b 1s
promise-c 2s
promise-a 3s
```

这种写法并不对，其实是将遍历写成了同步。

问题出在哪？出在 forEach 本身并不支持异步写法，你在 forEach 方法的前面加不加 await 关键字都是无效的，因为它的内部没有处理异步的逻辑。

forEach 是 ES5 的 API，要比 ES6 的 Promise 要早的多得多。为了向后兼容，forEach 以后也不会支持异步处理。

所以 forEach 的执行并不会阻塞 loopAsync 之后的代码，所以会导致阻塞失败，先输出 `[end]`。

## 串行写法：for 循环

```js
// 串行写法
for (const task of tasks) {
  const [ msg, t ] = task;
  const m = await sleepPromise(msg, t);
  console.log(m);
}
```

使用普通的 for 循环写法，await 的外层函数就仍就是 loopAysnc 方法，就能正确保存阻塞代码。

但这里的问题是，这些异步方法的执行是 **串行** 的。可以看到总共执行了 6 s。

```
[start]
promise-a 3s
promise-b 1s
promise-c 2s
[end] duration 6.01s
```

如果我们的这些请求是有顺序的依赖关系的，这样写是没问题。

但如果我们的场景是根据用户 id 数组从数据库中查找对应用户名，我们的时间复杂度就是 `O(n)` ，是不合理的。

此时我们需要改写为 **并行** 的异步，并且还要保证所有异步都执行完后才执行下一步。我们可以用 `Promise.all()`。

## 并行实现：Promise.all

```js
// 并行写法
const taskPromises = tasks.map(task => {
  const [ msg, t ] = task;
  return sleepPromise(msg, t).then(m => {
    console.log(m);
  });
});
await Promise.all(taskPromises);
```

首先，我们需要根据 tasks 数组生成对应的 promise 对象数组，然后传入到 Promise.all 方法中执行。

这样，这些异步方法就会同时执行。当所有异步都执行完毕后，代码才往下执行。

输出结果如下：

```
[start]
promise-b 1s
promise-c 2s
promise-a 3s
[end] duration 3.00s
```

3 秒就完事了，太强了。

## 回到 forEach

前面说到 forEach 底层并没有实现异步的处理，才导致阻塞失效，那么我们其实不妨实现支持异步的简易 forEach。

并行实现：

```js
async function forEach(arr, fn) {
  const fns = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    fns.push(fn(item, i, arr));
  }
  await Promise.all(fns);
}
```

串行实现：

```js
async function forEach(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    await fn(item, i, arr);
  }
}
```

用法：

```js
await forEach(tasks, async task => {
  const [ msg, t ] = task;
  const m = await sleepPromise(msg, t);
  console.log(m);
})
```

## 总结

简单总结一下。

一般来说，我们更常用 Promise.all 的并行执行异步的方法，常见于数据库查找一些 id 对应的数据的场景。

for 循环的串行写法适用于多个异步有依赖的情况，比如找最终推荐人。

forEach 则是纯粹的错误写法，除非是不需要使用 async/await 的情况。

我是前端西瓜哥，专注于分享前端知识，欢迎关注我。