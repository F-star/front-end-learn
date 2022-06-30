# JavaScript写一个 once 函数，让传入函数只执行一次

大家好，我是前端西瓜哥，今天我们做一道简单的前端面试题。

用 JavaScript 实现一个 once 函数，要求传入函数只能执行一次。且第二次及以后再调用时，仍会返回第一次执行的值。

效果要求如下：

```javascript
const addOnce = once(function(a, b) {
  return a + b;
});

addOnce(1, 2); 		// 3
addOnce(1, 2999);	// 依旧是 3
```

## 思路和实现

这里涉及到一个 **闭包** 的概念。

什么是闭包？闭包是一种技术，它能让 **一个函数访问另一个函数内的变量（或者叫关联的环境）**。

一种常见的方式就是调用一个函数 a，然后这个函数返回了一个新创建的函数 b。获得的效果是：新的函数 b 可以访问到 a 中声明的变量。

once 函数就要借助闭包的力量，返回 **一个绑定了作用域的新函数**。

我们先看看实现。

```javascript
function once(fn) {
  let ret; // 缓存结果用
  return function(...args) {
    if (!fn) return ret;
    ret = fn(...args);
    fn = undefined; // 表示已经执行过一次
    return ret;
  }
}
```

利用闭包，我们返回的新函数有两个 “私有” 的变量可以访问：

1. 传入的 fn 函数；
2. 额外声明的用于缓存结果的 ret 变量

当返回的新函数被调用时，我们先将参数传给 fn，拿到返回值缓存到 ret。然后将 fn 设置为 undefined（或 null），用于标识别已经执行了一次，最后返回 ret。

下次再调用时，我们通过判断 fn 为 falsy，直接返回缓存的 ret。

另外，你貌似可以加多一个对 fn 的类型校验：`typeof fn === 'function'`，来向面试官表达你的代码的健壮性。

有一个比较有趣的地方：**如果返回的是个对象，多次调用的返回值其实都是指向同一个**。如果你希望每次返回的对象都是新的对象，可以考虑返回一个拷贝后的对象（如果可以拷贝的话）。

## lodash.once 的实现

基本上这种面试上让你实现有一定场景的函数，lodash 大概率也会有实现。我们不妨看看 `lodash.once` 的实现。

`lodash.once` 的底层调用的是 `lodash.before`。

```javascript
function once(func) {
  return before(2, func);
}


var FUNC_ERROR_TEXT = 'Expected a function';
function before(n, func) {
  var result;
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  n = toInteger(n);
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}
```

基本上和前边我的实现差不多。


## 结尾

once 的实现并不复杂，只要利用闭包，用封闭的环境保存一个缓存的返回值，以及一个是否执行过的状态，就能控制函数的执行走向。

> 本文首发于我的公众号：前端西瓜哥


