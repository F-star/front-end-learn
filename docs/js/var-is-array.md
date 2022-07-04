# 判断变量是否为数组

大家好，我是前端西瓜哥，今天带大家学习在 JS 中如何判断一个对象是否为数组。

Array.isArray
-------------

最好的写法是使用 `Array.isArray(val)`。

因为该方法能正确判断 iframe 传过来的变量。

instanceof
----------

```js
val instanceof Array
```

对于一个普通数组，它的原型链是这样的：

```
数组实例 -> Array.protype -> Object.prototype -> null
```

如果一个变量是数组，那它的原型链上就一定会有 Array.prototype。

instanceof 的原理其实就左值沿着它的原型链，和右侧值的 prototype 属性比较，看是否相等。找到相等的就返回 true，否则返回 false。

但 instanceof 无法处理 iframe 的变量，因为 iframes 的 Array 并不是当前页面的 Array，它们指向各自的内存空间。

```js
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);

const ArrayInFrame = window.frames[0].Array; // iframe中的构造函数
const arr = new ArrayInFrame();

arr instanceof Array // false
Array.isArray(arr); // true
```

只要是能判断 **对象是否在原型链上** 的方法都是可以的用来判断是否为数组的，所以你还可以用：

```js
// isPrototypeOf 方法
// Array.prototype 是否在 val 的原型链上
Array.prototype.isPrototypeOf(val);

// getPrototypeOf 方法
// val 的上一个原型是否为 Array.prototype
Object.getPrototypeOf(val) === Array.prototype
```

Object.prototype.toString.call
------------------------------

```js
Object.prototype.toString.call(val) === '[object Array]';
```

对象都可以通过 toString 方法生成一个字符串，对于对象，通常会返回 `[object Xxx]` 的形式的字符串，对于数组，则会返回 `[object Array]`。

结尾
--

考虑到要兼容 iframe 的变量，所以建议使用 Array.isArray 方案。

此外判断数组还可以使用查找原型链对象的方法，以及通过 toString 得到的字符串的方法。

我是前端西瓜哥，欢迎关注我，掌握更多前端面试题。
