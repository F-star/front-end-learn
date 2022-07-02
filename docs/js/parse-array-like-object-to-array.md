# JS 中的类数组对象如何转换为数组？

大家好，我是前端西瓜哥，今天说一下 JS 的类数组对象是什么，以及如何将类数组对象转为数组。

类数组对象是什么？
---------

类数组对象，就是含有 length 属性的对象，但这个对象不是数组。

通常来说还会有 0 ～ length-1 的属性，结构表现上非常像一个数组。

```
const arrlike = {1:'a', 4: 'd', length: 9};
Array.isArray(arrlike) // false
```

从底层上来看，这个对象的原型链上没有 Array.prototype，所以我们不能用 Array.prototype 上的 forEach、map 等数组特有的方法。

> 关于原型链，可以看我的这篇文章：《[如何用原型链的方式实现一个 JS 继承？](https://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484613&idx=1&sn=c0557f675fe26477a973483f2229fea1&chksm=e948c1aede3f48b8f583d569e99f39a62104870d9876826c5fd7e87a19634e563b273f0b30fb&token=1978585004&lang=zh_CN&scene=21#wechat_redirect)》

如果强行给一个类数组对象使用 forEach 方法，会得到一个类型错误。

```
function f(a, b) {
  arguments.forEach(item => console.log(item));
}
// Uncaught TypeError: arguments.forEach is not a function
```

除了手动创造的类数组对象，还有以下常见的类数组对象：

*   **普通函数中的 argument 对象**。需要注意的是，箭头函数中不存在这个对象。
    
*   **一些获取 Dom 集合的方法**，如 document.querySelectorAll()、 document.getElementsByClassName、document.getElementsByTagName() 也会返回类数组对象
    

下面看看我们有哪些将类数组转换为数组的方法。

Array.prototyle.slice.call()
----------------------------

我们可以用 Array.prototyle.slice 内置方法。

```
Array.prototype.slice.call(obj);
[].slice.call(obj);
```

`[]` 空数组效果同 Array.prototype，因为空数组本身没有 slice 方法，会走原型链拿到 Array.prototype 的方法。空数组写法除了短一点没有任何优点。

然后 call 来自 Function.prototype，可以使用一个指定的 `this` 值来调用一个函数，这里是 Array.prototype.slice。我们不给 slice 方法传开始和结束位置参数，这样就会默认取整个范围。

> slice 的迭代时会跳过不存在的索引属性，所以你会看到 empty 的特殊值，和 undefined 还有点不同，你可以认为表示未被初始化。forEach、map 这些内置方法是会跳过它们不执行传入的回调函数的。

一个例子：

```
const arrlike = {1:'a', 4: 'd', length: 9};
const arr = Array.prototype.slice.call(arrlike);
console.log(arr);
```

  

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6159406a9096442a82f542b94f57b354~tplv-k3u1fbpfcp-zoom-1.image)

什么原理？

因为 slice 用于拷贝返回一个新的子数组，且只需要被操作的目标有 length 属性就行了。

下面是 Array.prototype.slice 的核心实现，默认 start 和 end 都在 length 范围内。

```
Array.prototype.mySlice = function(start, end) {
  if (start == undefined) start = 0;
  if (end == undefined) end = this.length;
  const cloned = new Array(end - start);
  for (let i = 0; i < cloned.length; i++) {
    // 为了确保不存在的索引保持为 empty 值
    if (i in this) {
      cloned[i] = this[start + i];
    }
  }
  return cloned;
}
```

你会发现，类数组对象替换掉这里的 this 后，能拷贝出一个真正数组。

Array.from()
------------

ES6 新出的方法，可以将类数组对象或者是可迭代对象转换为数组。

```
const arrlike = {1:'a', 4: 'd', length: 9};
arr = Array.from(arrlike);
console.log(arr);
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84695f2d9df9456c89194b59897190e1~tplv-k3u1fbpfcp-zoom-1.image)

和 Array.prototyle.slice.call() 有点不同，不存在的索引的值被设置了 undefined。

> 如果一个对象，既是类数组对象，又是可迭代对象，Array.from() 方法会使用该对象的迭代器方法。

一般来说，调用 JS 的内置方法返回类数组对象同时是可迭代对象，我们通常喜欢用扩展运算符（`...`），更优雅。

```
const elCollection = document.getElementsByTagName('div');
const elArray = [...elCollection];
```

结尾
--

一般来说，我们在开发中遇到的类数组对象都是 JS 内置方法返回的，同时也是可迭代对象，我们一般都是用 `[...arrlik]` 扩展运算符，咻咻咻搞定。

如果类数组对象不是可迭代对象，可以使用 `Array.prototyle.slice.call()` 和 `Array.from()`。

前者会对不存在的索引维持为 empty，后者则是 undefined。我们可以认为基本差别不大，建议用 `Array.from()`，语义化更好些。

> 首发于公众号：前端西瓜哥
