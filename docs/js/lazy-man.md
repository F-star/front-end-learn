# 实现一个 LazyMan 方法

大家好，我是前端西瓜哥。今天我们来看一道 JS 编程题。

问题
--

实现一个LazyMan，可以按照以下方式调用:

```
LazyMan("Hank")
输出:
Hi! This is Hank!

LazyMan("Hank").sleep(10).eat("dinner")
输出
Hi! This is Hank!
//等待10秒..
Wake up after 10
Eat dinner

LazyMan("Hank").eat("dinner").eat("supper")
输出
Hi! This is Hank!
Eat dinner
Eat supper

LazyMan(“Hank”).sleepFirst(5).eat(“supper”)输出
//等待5秒
Wake up after 5
Hi! This is Hank!
Eat supper

```

以此类推。

需要实现的功能
-------

我们先分析一下需要的效果。

首先是 `Lazy('Hank')` ，能够输出 `Hi! This is Hank`。

然后是 `.sleep(10)`，会延迟 10 秒后，执行 `Wake up after 10`。之后的 eat 之类的会跟着延迟执行。

`.eat('dinner')`，是直接输出 `Eat dinner`。

最后是一个比较特殊的 `.sleepFirst(5)`，它会被放到最前面提前执行，再执行其他事情。

思路
--

这道题不简单，它考察了多个知识点。

首先是它的使用形式为 **链式调用**，即对象的方法调用完后会返回这个对象，然后就可以继续调用这个对象的其他方法，形成一条链条一样的调用写法。

所以，这个 `LazyMan('Hank')` 应该返回一个对象，这个对象还必须有  `sleep`、`eat`、`sleepFirst` 这些方法。

所以，我先这样写：

```js
function LazyMan(name) {
  const solver = {
    sleep(second) {
      return solver;
    },
    eat(something) {
      return solver;
    },
    sleepFirst(second) {
      return solver;
    },
  };
  return solver;
}

```

solver 的方法也可以返回 this。这里我没有返回 this，因为担心有 this 指向丢失的问题。

还有一种是使用 ES6 的 class 写法。

```js
function LazyMan(name) {
 return new MyLazyMan(name);
}

class MyLazyMan {}

```

多了一层封装，但可以更好地维护属性。否则就像我的写法那样，需要用闭包来维护变量。

回到正题。

然后我们再实现依次输出的效果，因为其中的 `sleep`，是异步的，而且 `sleepFirst` 还会前置输出，所以我们不能每执行一个方法，就立即输出。而是要先缓存一下，等到所有方法都调用完之后，再执行。

此外，因为要收集好所有任务才开始执行，所以我们要用 setTimeout 构造一个异步的宏任务，确保任务的执行在同步代码后执行。

```js
function LazyMan(name) {
  setTimeout(() => { // 确保不会过早执行
    run();
  });

  function run() {
    // 依次执行任务
  }
}

```

所以，我们需要一个 **队列** 来保存。队列是一种先进先出的线性表，我们用数组实现，理论上性能更好是用链表，但要自己实现很麻烦，通常数据量也不大，所以开发中我们用数组就完事了。

一个重要的分歧点出现了，这个队列，保存什么？

一种想法是 queue 存一个对象，里面有 msg 和 t，记录输出内容，和延迟执行的时间。

```js
{
  msg: `Wake up after 10`,
  t: 10,
}

```

还有一种想法是，queue 里存的是函数，将它们依次执行就好。

实现上类似 **中间件** 的写法，本质是设计模式的 **责任链模式**。执行完当前函数，我们调用 next 去执行下一个函数。如果你用过 Express 框架，可能就觉得比较熟悉。

run 是一个递归函数，不停地执行自身，从 queue 里取出第一个 task，执行它，然后再执行 run 方法，直到 queue 为空。

代码实现
----

```js
function LazyMan(name) {
  const queue = [
    {
      msg: `Hi! This is ${name}`,
      t: undefined,
    },
  ];

  setTimeout(() => { // 确保在同步代码后执行
    run();
  });

  function run() { // 依次执行任务
    if (queue.length === 0) return;
    const { msg, t } = queue.shift();

    // 不需要延迟执行的任务，我把它们转为同步执行了
    // 让它们都一致用异步执行也是可以的
    if (t === undefined) {
      console.log(msg);
      run(); // 执行
    } else {
      setTimeout(() => {
        console.log(msg);
        run();
      }, t * 1000);
    }
  }

  const solver = {
    sleep(second) {
      queue.push({
        msg: `Wake up after ${second}`,
        t: second,
      });
      return solver;
    },
    eat(something) {
      queue.push({
        msg: `Eat ${something}`,
        t: undefined,
      });
      return solver;
    },
    sleepFirst(second) {
      // 比较特殊，要放到队列开头
      queue.unshift({
        msg: `Wake up after ${second}`,
        t: second,
      });
      return solver;
    },
  };
  return solver;
}

```

对于 sleep 这些方法，我只是负责让它们加入队列，具体的执行我都是在 run 里统一处理的。

我去网上看了下其他人的写法，发现比较多的是 Express 的 next 这种风格，那我也写一个吧。

```js
function LazyMan(name) {
  return new MyLazyMan(name);
}

class MyLazyMan {
  constructor(name) {
    this.queue = [];
    this.queue.push(() => {
      setTimeout(() => {
        console.log(`Hi! This is ${name}`);
      })
      this.next(); // 千万不要忘记执行 next
    })

    // 这里依旧是确保在同步代码后执行
    setTimeout(() => {
      this.next();
    })
  }
  next() {
    setTimeout(() => {
      if (this.queue.length === 0) return;
      const task = this.queue.shift();
      task();
    })
  }
  eat(something) {
    this.queue.push(() => {
      console.log(`Eat ${something}`);
      this.next();
    });
    return this;
  }
  sleep(second) {
    this.queue.push(() => {
      setTimeout(() => {
        console.log(`Wake up after ${second}`);
        this.next();
      }, second * 1000);
    });
    return this;
  }
  sleepFirst(second) {
    this.queue.unshift(() => {
      setTimeout(() => {
        console.log(`Wake up after ${second}`);
        this.next();
      }, second * 1000)
    });
    return this;
  }
}

```

这里的注意点是，在 setTimeout 里不要忘记加上 this.next，否则执行的链条会在中途断掉。

写法很多，除此之外还可以用 Promise，用上 async/await，甚至用上 rxjs，读者可自行去尝试。

结尾
--

这道编程题，考察的东西比较多，包括业务代码编写能力、队列、中间件思想（责任链模式）、异步代码。

不知道各位是否学会？

> 公众号：前端西瓜哥
