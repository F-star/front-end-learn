
# 实现一个返回特定区间内随机整数的方法

大家好，我是前端西瓜哥。

今天来做一道 JS 题，给你一个最小值和一个最大值，要求你返回位于这个区间的随机数。随机数包含最小值和最大值。

```js
function getRandom(min, max) {
  // 获取 [min, max] 区间中的一个随机整数
}
```

实现
--

既然是随机数，我们自然要用到 JS 自带的 Math.random() 方法。

Math.random 会返回大于等于 0，小于 1 的随机小数，不符合我们的需求。为此我们需要在上面进行区间的放大，让区间中的整数数量可以覆盖 \[min, max\] 范围。

```js
Math.random()
// [0, 1)

Math.random() * size
// [0, size)
```

这个 size 是多少呢？是 `max - min + 1`。在做算法题的时候，我最烦的就是两个索引相减是否要加一。

其实这是我们小学遇到的 **植树问题**：每间隔一段距离，种一棵树，问树的数量或最左最右两端树的距离。

```
|___|___|
3   4   5

```

看上面的例子，如果我们求树的数量，就是 3（等于 5 - 3 + 1）；如果求距离，就是 2（等于 5 - 3）。

所以对于左闭右闭的 \[min, max\] 来说，其中的整数数量为 `max - min + 1`。

然后我们再加上 min，区间就变成下面这个样子

```js
Math.random() * (max - min + 1) + min
// [min, max - min + 1 + min)
// 等价
// [min, max + 1)
```

此时我们的随机数是介于 `[min, max + 1)` 区间的随机小数，接下来我们向下取整，就能得到我们想要的 `[min, max]` 区间的整数了。

```js
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

核心算法是实现了，我们再稍微对传入的参数做一点修正操作，让代码更健壮一些。

```js
function getRandom(min, max) {
  if (min > max) {
    [min, max] = [max, min]; // 交换
  }
  min = Math.floor(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

理论上第一个参数应该为小的数，第二个参数为大的数，但无法保证使用者会遵守，那我们做点额外工作，在必要时交换两个参数的值。

然后是传入的值为小数的情况，简单给它转为整数就好了。

结尾
--

很简单一道题，但要注意细节，希望你能掌握。

> 本文首发于我的公众号：前端西瓜哥