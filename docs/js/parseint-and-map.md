# ['1', '2', '3'].map(parseInt) 结果是什么？

大家好，我是前端西瓜哥，本文讲的是一道比较经典的前端面试题，本文将会深入分析此题，深挖知识点，让你完全掌握此题的解法。

这是道 Web 前端的陈年烂题，烂是烂，但我就是要说，高考也是年年有呢。此题考察的是对 JavaScript 方法的熟悉程度。

不直接给出答案，我们先看看思路。

## Array.prototype.map

首先是 `Array.prototype.map` 方法，这是数组实例的方法。给 map 传入一个回调函数，map 就会遍历数组元素，将相关信息一起传入回调函数，并取这个回调函数的返回值作为新数组的对应索引的元素，并将这个新数组返回。

回调函数每次可以拿到的当前迭代的（1）数组元素（2）索引值（3）以及数组本身。

```js
[1,2,3].map((value, index, array) => {
	return value * 2;
})
// 返回 [2, 4, 6]
```

如果你是初学者，可能会对这个黑盒底层是怎么实现有些疑惑，我就顺手实现一下 `Array.prototype.map` 方法，以便读者加深理解。

```js
Array.prototype.myMap = function(callbackfn) {
  const arr = this;
  const retArr = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    retArr[i] = callbackfn(arr[i], i, arr);
  }
  return retArr;
}
```

## parseInt

`Array.prototype.map` 方法其实还算简单，parseInt 则要复杂得多的多了。

parseInt 函数的作用是将一个字符串转换为数字。

`parseInt(string [, radix])` 接受两个参数，第一个参数是我们需要转换的字符串。第二个参数是字符串的基数 radix，比如是 2 的话，就代表字符串是用二进制表达的。需要特别注意的是，第二个参数是可选的。

第二个参数如果省略，情况会变得复杂。如果字符串以 `0x` 或 `0X` 开头，它就会当作十六进制，否则被当作十进制。

下面说一些例子：

```js
parseInt('10', 2);
// => 2。(1 * 2 + 0 * 1)

parseInt('0xa');
// => 10。被当作十六进制，等价于 parseInt('a', 16)

parseInt('123');
// => 123。被当作十进制，最常见的用法，
```

理论上基数 radix 应该为大于等于 2，小于等于 36 的数字，否则会被当作不合法，返回 NaN。但有一个值除外，那就是 0。

**当 parseInt 的第二个参数 radix 为 0 时，parseInt 会当作第二个参数没有传，所以字符串会被当成十进制。**

**此外当字符串第一个非空格字符不能转换为数字时，也会返回 NaN。**

## 回到本题

`['1', '2', '3'].map(parseInt)`的 parseInt 作为回调函数拿到了 map 提供的三个参数，得益于 JavaScript 是非常方便的弱类型语言，所以传参数量不匹配也不会报错的，只会把不用的参数抛弃掉，缺少的参数设置为 undefined。

这里 parsetInt 只用到两个参数，分别是 **数组元素** 和 **索引值**。也就是：

```js
parseInt('1', 0);
// 1    特殊情况，等价于parseInt('1')

parseInt('2', 1);
// NaN  没有一进制这种东西

parseInt('3', 2);
// NaN  没能找到合法字符，虽然 3 是数字，但它无法用来表达二进制，二进制只能为 0 和 1。
```

所以返回结果为：`[1, NaN, NaN]`。

> 欢迎关注我的公众号：前端西瓜哥。分享我最新最快的前端技术文章。