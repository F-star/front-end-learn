# 数组去重


**数组去重** 是常见的面试考点，所以我就试着深入学习一下。网上也有很多数组去重的文章，但我自己觉得分析地不够深入，其实其中很多的实现都是重复的，可以归为一类，比如 双重循环法 和 indexOf法 的本质都是双重循环，故写下此文，做进一步的总结，同时加深理解。

### 1. 双重循环

这种方法就很直接，很好理解。那就是创建一个新的空数组，每次我们会从原数组中取出一个元素，拿它和新数组的元素进行一一比较。如果在新数组没发现和取出元素相等的元素，就将其放入这个新数组中；如果发现有和取出元素相等的元素，不放入新数组中。当原数组中的数组全都取出来时，这个新数组就是去重后的所有数据了。

这种数组去重的实现的时间复杂度是 O(n^2)。

```js
const unique = arr => {
    let res = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        let j = 0, len2 = res.length;
        for (; j < len2; j++) {
            if (arr[i] === res[j]) break;
        }
        if (j == len2) res.push(arr[i]);  // j == len2 表示没有执行 break。
    }
    return res;
}
```

当然这里的第一个循环可以改为 `forEach()` 方法，第二个 for 循环可以改为使用 `includes()` 或者 `indexOf()` 方法，时间复杂度没什么变化，不过代码更简洁。

```js
const unique = arr => {
    let res = [];
    arr.forEach(item => {
        if (!res.includes(item)) res.push(item); 
    })
    return res;
} 
```

### 2. 查找元素第一次出现的位置

从后往前遍历数组，检测元素第一次出现的位置是否为当前元素的位置。如果不是，说明有重复，移除当前元素；如果没有，就不移除。

之所以从后往前遍历，是因为我们要搬移元素（其实就是 splice）。当然你也可以选择从前往后遍历，不过这样的话，如果遍历时当前元素被移除了，那么移除元素后的 arr[i] 对应的元素其实是原来 arr[i+1]，因此此时 i 不能自增，且结束的条件要改为 `i == len-1`，就很麻烦。

这种写法不需要创建新的数组，空间复杂度为 O(1)。
<!--这种实现就不需要创建一个新数组，-->

```js
const unique = arr => {
    for (let i = arr.length - 1; i >= 0; i--) {
        for (let j = 0; j < i; j++) {
            if (arr[j] === arr[i]) arr.splice(i, 1);
        }
    }
    return arr;
}
```

这里的代码实现是尽量减少时间复杂度的。说个题外话，其实上面这里还可以再优化一下，因为我们这里的元素搬移并不是一次性搬移到最终的位置上的。优化思路是先标记要所有要删除的元素索引，然后从前往后遍历数组，每遇到第 m 个删除索引，后面的元素就覆盖掉它们往前第 m 位的数组元素，这里就不实现了，也就随便提一下。

如果改为配合使用 `filter()` 和 `includes()` 方法的话，我们可以让代码可读性更好一些（性能会稍微下降，因为 incluedes 会遍历整个数组），具体实现就不写了。

### 3. 排序后去重

排序算法有很多种，我们就用 js 自带的排序算法吧。顺带一说，v8引擎 的 [`sort()`](https://github.com/v8/v8/blob/ad82a40509c5b5b4680d4299c8f08d6c6d31af3c/src/js/array.js#L760) 方法在数组长度小于等于10的情况下，会使用插入排序，大于10的情况下会使用快速排序。

排（guai）好（guai）序（zhanhao）后，检查前后两个相邻元素，如果当前元素和前面的元素不相等，才将当前元素放入新数组中。

```js
const unique = arr => {
    if (arr.length < 2) return arr; 
    arr.sort();
    let r = [arr[0]];
    for (let i = 1, len = arr.length; i < len; i++) {
        if (a[i] !== a[i - 1]) r.push(a[i]);
    }
    return r;
}
```

这种去重局限性非常大。它不适用于对象，因为对象不适合进行排序。sort() 的默认排序顺序是根据字符串Unicode码点进行排序，貌似会把对象转为字符串再进行排序，一般的对象都会转为 "[object Object]"，无法保证两个引用同一个对象的变量能相邻排列。


### 4. 使用散列表

散列表，在 JavaScript 中是通过对象来实现的。散列表的优点是，一般情况下读取数据的时间复杂度是 O(1)。但 js 的对象的键只能为字符串类型，不过可以考虑使用 ES6 新增的 Map 数据结构，它允许使用任何类型的值作为键。

下面的实现使用的是普通对象作为散列表，有很大的局限性，无法对 js对象 进行去重（对象都会转为类似 [object Object] 的字符串）。另外，对于js对象来说，a['1'] 和 a[1] 是相等的，因为1会转换为'1'，这样就无法分辨出 1 和 '1'，从而错误地在去重过程中丢弃其中的一个元素，所以我做了简单地改良，键名使用的不是 `arr[i]` 而是 `typeof(arr[i]) + arr[i]`。

```js
const unique = arr => {
    let r = [];
    let map = {};
    for (let i = 0, len = arr.length; i < len; i++) {
        const item = arr[i];
        if (!map[typeof(item) + item]) {
            r.push(arr[i]);
        }
        map[typeof(item) + item] = true; 
    }
    return r;
} 
```

这种实现方式，时间复杂度可以达到 O(n)。

如果考虑对象也能去重，可以考虑使用 ES6 的 Map。

### 5. ES6 的 Set

ES6 提供了新的数据结构。Set 实例会认为两个 NaN 是相等的（尽管 NaN !== NaN），并认为两个对象是不等的（当然这里两个对象的意思，表示的是两个指向不同内存空间的引用类型变量）。

并不太了解 Set 的源码实现，就不分析性能了。

```js
const unique = arr => {
    return Array.from(new Set(arr))
}
```

非常简洁，如果你的运行环境支持 ES6，或者可以编译成 ES5，我很推荐使用这个去重方案。

### 考虑 NaN 的去重

如果要考虑 NaN 的去重，就需要稍微对代码进行一些修改。

简单来说就是，判断 item 是否为 NaN，然后检查返回的数组中是否已有 NaN。如果有，放入数组；否则不放入。

```js
const unique = arr => {
    let res = [];
    let hasNaN = false;
    arr.forEach(item => {
        if(!hasNaN && Number.isNaN(item)) {
            res.push(item);
            hasNaN = true
        }else if (!res.includes(item)) {
            res.push(item); 
        }
    })
    return res;
} 
```

### lodash 如何实现去重

简单说下 lodash 的 uniq 方法的源码实现。

这个方法的行为和使用 Set 进行去重的结果一致。

当数组长度大于等于 200 时，[会创建 Set 并将 Set 转换为数组来进行去重](https://github.com/lodash/lodash/blob/master/.internal/baseUniq.js#L36)（Set 不存在情况的实现不做分析）。当数组长度小于 200 时，会使用类似前面提到的 [双重循环](https://github.com/lodash/lodash/blob/master/.internal/baseUniq.js#L46) 的去重方案，另外还会做 NaN 的去重。

### 总结

一般来说，在开发中，要进行去重的数组并不是很大，不必太考虑性能问题。所以在工程中，为了不把简单的问题复杂化中，建议使用最简洁的 ES6 的 Set 转数组的方案来实现。当然具体问题具体分析，要根据场景选择真正合适的去重方案。

另外，其实 “相等” 有很多种定义，ES6 中就有四种相等算法，这里就不多说了，有兴趣的话可以看看这篇文章：[JavaScript 中的相等性判断](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness)。依旧是根据场景选择合适的相等算法。

### 参考

- [掘金--7种方法实现数组去重](https://juejin.im/post/5aed6110518825671b026bed)
- [JavaScript专题之数组去重](https://github.com/mqyqingfeng/Blog/issues/27)
- [lodash 的 uniq 方法实现](https://github.com/lodash/lodash/blob/master/uniq.js)
- [JavaScript 中的相等性判断](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness)
