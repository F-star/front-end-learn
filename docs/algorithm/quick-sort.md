# 快速排序的经典实现，你真的会写吗？

快速排序，简称快排。快排是所有排序算法中应用最广泛的。接下来我们将会说说一个经典的快排是如何实现的。

## 思路

快排的核心思想是**分治**。

所谓分治，就是分而治之的意思，将原来的问题拆分为多个规模较小子问题，这些子问题还能继续拆分，就是所谓套娃，直到规模小到直接求解。通过解决子问题，完成父问题，最终解决了原问题。

分治这个思想在实现上，使用的方法是**递归**。递归，是指函数执行中调用函数的一种形式，当递归到一定程度，就会触发退出递归的逻辑。

分治是思想，递归是方法，不要将二者混为一谈。

具体要做的就是**对数组分区（partition）** 。

对于提供的数组，我们随意从中找一个数组元素找出一个基准值（pivot），或者叫做中间值。然后通过分区函数（partition）将数组分为两部分，左边的小于等于 pivot 的部分，和右边的大于 pivot 的部分。

然后我们的分治（或者叫递归）就继续针对左侧和右侧进行同样的操作，直到区间大小小于等于 1。

## 实现

我们先看代码实现。

```js
function quickSort(arr) {
  partition(arr, 0, arr.length - 1);
  return arr;
}

function partition(arr, lo, hi) {
  if (lo >= hi) return; // 递归跳出条件，能够直接求解的子问题
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      swap(arr, i, j) // 交换 
      i++;
    }
  }
  swap(arr, i, hi);
  partition(arr, lo, i - 1);
  partition(arr, i + 1, hi);
}

function swap(arr, i, j) {
  let tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}
```

核心算法就是这个 partition 算法。该算法实现得很巧妙，能够做到原地排序（不使用额外的数据结构）。

partition 接受一个数组，以及要进行分区的索引区间 `[lo, hi]`，注意这是个左闭右闭的闭区间。

这里维护了一个 i 指针和一个 j 指针。j 指针每次迭代都会加一。`[lo, i)` 这个区间则代表小于等于 pivot 的区间，这个区间是动态的，因为 i 会变化。

在遍历时，如果当前值小于等于 pivot，就会把这个值放到 `[lo, i)` 区间。实现上就是交换 i 和 j 上数组元素的位置，然后让 i 自增一。


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2df7f4e977ed4b3f994d6570ea91ab02~tplv-k3u1fbpfcp-watermark.image?)

**需要特别注意的是，遍历是不能有 j == hi 的情况**，并需要在遍历结束后将 pivot 请到中间。假设改为 `j ≤ hi` ，因为 i 对应的元素为大于等于 pivot 的元素，如果它比 pivot 大，i 和 pivot 就不会交换了。

## 为什么快排使用最广泛？

快排的平均时间复杂度是 `O(n * logn)`，比冒泡排序、插入排序这些时间复杂度为`O(n^2)`的算法要好得多。具体的推导过程有点复杂，这里就不进行展开了。

归并排序的时间复杂度同样是 `O(n * logn)`。快排在极端情况下，时间复杂度会退化变成 `O(n^2)`

，而归并排序不会。在时间复杂度上确实归并排序要更好一些。

但是快排能够做到原地排序，节省内存空间，即空间复杂度为 O(1)，而归并排序的空间复杂度为 O(n)。

**但快排也有个严重的缺点，因为交换元素的关系，快排是不稳定排序**。排序后，相同的值可能和原来相同值的相对顺序不同，只是排序数组还好，但在对对象根据 id 排序的情况时，可能就会让我们困扰。

## 一些奇怪的快排实现

在网上我看到这样的实现。

```js
var quickSort = function (arr) {
  if (arr.length <= 1) { return arr; }
  var pivotIndex = Math.floor(arr.length / 2);
  var pivot = arr.splice(pivotIndex, 1)[0];
  var left = [];
  var right = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return quickSort(left).concat([pivot], quickSort(right));
};
```

这个实现思想上是对的，也是分治和分区思想，但致命问题是，它不是原地排序，需要用到额外的数组。面试的时候最好别写这种实现，虽然看起来更简短一些。

快排思想并不复杂，但实现上用了很多变量，对初学者还是需要花时间去理解。

> 本文首发于我的公众号：前端西瓜哥

