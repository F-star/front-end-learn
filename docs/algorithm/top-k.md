# TopK 算法的多种实现

我是前端西瓜哥，今天来整下 TopK 算法。

TopK，即求数组的最小（或最大）的 k 个数，且不要求这些数要排序返回。

这是一个非常经典的面试题。解法也是相当的多，能较好考察面试者的数据结构与算法基础。


![image-20220131191642528.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69f4dfc001a84859902023b30601e5e5~tplv-k3u1fbpfcp-watermark.image?)

求最小和最大的思路是一样的，我们假设要求的是最小的 k 个数。

对应的 LeetCode 题目地址有两个：

- 《剑指 Offer（第 2 版）》第 40 题：https://leetcode-cn.com/problems/zui-xiao-de-kge-shu-lcof/

- 《程序员面试经典（第 6 版）》17.14 题：https://leetcode-cn.com/problems/smallest-k-lcci/ 

## 排序

最简单的方式是**全排序**，即对数组的所有元素都进行升序排序，然后取前面的 k 个数。通常都会用编程语言自带的排序 API，正确性有所保证。

```typescript
function getLeastNumbers(arr: number[], k: number): number[] {
  return arr.sort((a, b) => a - b).slice(0, k);
};
```

实际开发中如果有这个需求，且数据量不大，用自带的排序方法是最稳妥的。

因为排序方法底层通常是快排这些时间复杂度优秀的排序算法，所以全排序的时间复杂度是 `O(n*log(n)`。

在全排序的基础上，其实可以做个优化，做 **局部排序**。有些算法（冒泡和选择排序）的排序过程中，第 i 次迭代，都会使得第 i 个元素置于最终排好序后所在的位置。

这里我们看看魔改选择排序的实现：

```typescript
function getLeastNumbers(arr: number[], k: number): number[] {
  let min: number;
  let minIdx: number;
  for (let i = 0; i < k; i++) { // 这里迭代了 k 次
    min = arr[i];
    minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < min) {
        min = arr[j];
        minIdx = j;
      }
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; // 交换
  }
  return arr.slice(0, k);
};
```

只要我们将原来的 n 次迭代改为 k 次迭代，就能获得一个只是前 k 个数组元素做了排序的数组。

局部排序在原来时间复杂度为 `O(n^2)` 的排序算法的基础上，优化为了 `O(k*n)`。

当 k 很小时，局部排序的效率要比全排序的高。

## 快排思想

快速排序的核心是 **分治** 和 **分区**。

限于篇幅，具体的快排原理和实现可以看我的这篇文章：[快速排序的经典实现，你真的会写吗？](https://juejin.cn/post/7057546951260110878)

简单来说，快排的实现是，每次取一个基准值 pivot，将小于等于 pivot 的放到左区间，大于的放到右区间。然后针对这两个区间继续同样操作，直到区间大小小于等于 1 为止，是自上而下的递归。

**原来快排对两个区间都要进行递归，现在改造为选择性地递归。**

每一次分区（partition）后：

- 如果 pivot 所在的位置小于 k，递归就可以结束了，此时数组的前 k 个数组元素就是最小的 k 个元素；

- 如果 pivot 所在的位置在 k 的左侧，说明 pivot 的左区间可以不用排序了，小于等于 pivot 的值都在左侧。然后对右区间进行递归；
- 如果 pivot 所在的位置在 k 的右侧，则 pivot 的右区间不用考虑了，需要对左区间递归。

**这里有一个非常重要的点：每次分区分后 pivot 所在索引的值就是整个数组排过序后应该为的值。** 这是我们可以不管其中一个区间的原因。

```typescript
function getLeastNumbers(arr: number[], k: number): number[] {
  partition(arr, 0, arr.length - 1, k);
  return arr.slice(0, k);
};

function partition(arr: number[], lo: number, hi: number, k: number) {
  if (lo >= hi) return;
  const pivot = arr[hi];  // 这里可以改为随机选择 pivot
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      swap(arr, i, j);
      i++;
    }
  }
  swap(arr, i, hi);
  
  // 原本的快排的 partition 的最后是这两行，现在改为现在的下面这五行
  // partition(arr, i + 1, hi, k);
  // partition(arr, lo, i - 1, k);
  if (i < k) {
    partition(arr, i + 1, hi, k);
  } else if (i > k) {
    partition(arr, lo, i - 1, k);
  }
}

function swap(arr: number[], i: number, j: number) {
  let tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}
```

平均时间复杂度是 `O(n)`，最坏时间复杂度是 `O(n^2)`。不管怎样总体上都比快排效率高，除非极端情况。

## 大顶堆

大顶堆是个完全二叉树，特点是：任何一个节点的值都大于等于子树任意一个节点的值。

我们创建一个大小为 k 的大顶堆。先放入 k 个元素。后面想放入新元素时，先和堆顶元素（堆的最大值）对比。如果小于堆的最大元素，说明这个堆顶元素不合格，不可能为 TopK 的一员，将其出堆，然后让新元素入堆；否则新元素不入堆。

一直这样操作直到遍历完整个数组。最后这个堆就是我们要的 TopK。

JavaScript 没有内置堆或优先队列这些数据结构，就暂且不实现了。

入堆的时间复杂度是 `O(log k)`，要入堆 n 次，所以总的时间复杂度是 `O(n*log k)`。

**如果你需要动态维护 TopK，比如网站的每日排行榜，用大顶堆方案会更合适。**

## 结尾

总的来说，快排思想的方案时间复杂度最低，大顶堆适合需要动态维护 TopK 的情况，而全排序则适合写业务代码且数据量不大的时候。

> 本文首发于我的公众号：前端西瓜哥

