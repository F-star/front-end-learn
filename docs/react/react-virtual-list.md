# 长列表优化：用 React 实现虚拟列表

大家好，我是前端西瓜哥。这次我们来看看虚拟列表是什么玩意，并用 React 来实现两种虚拟列表组件。

虚拟列表，其实就是将一个原本需要全部列表项的渲染的长列表，改为只渲染可视区域内的列表项，但滚动效果还是要和渲染所有列表项的长列表一样。

虚拟列表解决的长列表渲染大量节点导致的性能问题：

1.  一次性渲染大量节点，会占用大量 GPU 资源，导致卡顿；
    
2.  即使渲染好了，大量的节点也持续占用内存。列表项下的节点越多，就越耗费性能。
    

虚拟列表的实现分两种，一种是列表项高度固定的情况，另一种是列表项高度动态的情况。

列表项高度固定
-------

列表项高度固定的情况会简单很多，因为我们可以在渲染前就能知道任何一个列表项的位置。

因为涉及到的变量很多，实现起来还是有点繁琐。

我们需要的必要信息有：

1.  容器高度（即可视区域高度） containerHeight
    
2.  列表长度（即列表项总数） itemCount
    
3.  列表项尺寸 itemHeight
    
4.  滚动位置 scrollTop
    

![ZSK4Sv](https://fe-watermelon.oss-cn-shenzhen.aliyuncs.com/ZSK4Sv.jpg)

> 虚拟列表通常来说是垂直方向的，但偶尔也有水平方向的场景，所以如果你要实现一个广泛适用的组件，理论上应该用 size 而不是 height，前者语义更好。
> 
> 但为了减少用户的思维转换导致的负担，本文会使用 height 来表示一个列表项的高度。

要让表单项渲染在正确位置，我们有几种方案：

1.  在容器的第一个元素用一个空元素，设置一个高度，将需要显示在可视区域的 items 往下推到正确位置。我尝试着实现了，发现滚动快一点就会有闪屏现象。
    
2.  将需要渲染的元素一个 div 包裹起来，对这个 div 应用 `transform: translate3d(0px, 1000px, 0px);`
    
3.  对每个列表项使用绝对定位（或 transform）
    

这里我们选择第一个方案来进行实现。

### 代码实现

这里我先给出代码实现。

我们实现了一个 FixedSizeList 的 React 组件。

它接收一个上面提到的几个数量和高度参数外，还接收一个列表项组件。

我们会将计算出来的高度做成 style 对象以及一个索引值 index传入到这个组件里进行实例化。所以记得在列表项组件内接收它们并使用上它们，尤其是 style。

```jsx
/**
 * 一个将 items 往下推到正确位置的空元素
 */
import { useState } from 'react';
import { flushSync } from 'react-dom';

function FixedSizeList({ containerHeight, itemHeight, itemCount, children }) {
  // children 语义不好，赋值给 Component
  const Component = children;

  const contentHeight = itemHeight * itemCount; // 内容总高度
  const [scrollTop, setScrollTop] = useState(0); // 滚动位置

  // 继续需要渲染的 item 索引有哪些
  let startIdx = Math.floor(scrollTop / itemHeight);
  let endIdx = Math.floor((scrollTop + containerHeight) / itemHeight);

  // 上下额外多渲染几个 item，解决滚动时来不及加载元素出现短暂的空白区域的问题
  const paddingCount = 2;
  startIdx = Math.max(startIdx - paddingCount, 0); // 处理越界情况
  endIdx = Math.min(endIdx + paddingCount, itemCount - 1);

  const top = itemHeight * startIdx; // 第一个渲染的 item 到顶部距离

  // 需要渲染的 items
  const items = [];
  for (let i = startIdx; i <= endIdx; i++) {
    items.push(<Component key={i} index={i} style={{ height: itemHeight }} />);
  }

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => {
        // 处理渲染异步导致的空白现象
        // 改为同步更新，但可能会有性能问题，可以做 节流 + RAF 优化
        flushSync(() => {
          setScrollTop(e.target.scrollTop);
        });
      }}
    >
      <div style={{ height: contentHeight }}>
        {/* 一个将 items 往下推到正确位置的空元素 */}
        <div style={{ height: top }}></div>
        {items}
      </div>
    </div>
  );
}
```

线上 demo：

https://codesandbox.io/s/jhe2rt

效果：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97b85253ae81416bb6192c7012832fa9~tplv-k3u1fbpfcp-zoom-1.image)

首先我们需要知道 **渲染的节点的索引值范围**。

```js
// 计算需要渲染的 item 范围
let startIdx = Math.floor(scrollTop / itemHeight);
let endIdx = Math.floor((scrollTop + containerHeight) / itemHeight);
```

首先算第一个 item 的位置 startIdx。

我们用 scrollTop 除以列表项高度 itemHeight，我们就知道 scrollTop 经过了多个 item，将得到的结果向下取整就是可视区域中的第一个 item。最后一个索引值 endidx 计算同理。

有时候我们希望上下方向再多渲染几个 item（缓解在做节流时没有立即渲染导致的空白现象），我们可以让范围往两边扩展一些，注意不要越界。

```js
// 扩展范围
const paddingCount = 2;
startIdx = Math.max(startIdx - paddingCount, 0); // 处理越界情况
endIdx = Math.min(endIdx + paddingCount, itemCount - 1);
```

然后基于这个范围，对列表项组件进行实例化。

```js
// 需要渲染的 items
const items = [];
for (let i = startIdx; i <= endIdx; i++) {
  items.push(<Component key={i} index={i} style={{ height: itemHeight }} />);
}
```

然后是 **DOM 结构的说明**。

```jsx
<div
  style={{ height: containerHeight, overflow: 'auto' }}
  onScroll={(e) => {
    // 处理渲染异步导致的空白现象
    // 改为同步更新，但可能会有性能问题，可以做 节流 + RAF 优化
    flushSync(() => {
      setScrollTop(e.target.scrollTop);
    });
  }}
>
  <div style={{ height: contentHeight }}>
    {/* 一个将 items 往下推到正确位置的空元素 */}
    <div style={{ height: top }}></div>
    {items}
  </div>
</div>
```

最外层是“容器 div”，我们给它的高度设置传入的 containerHeight。

接着是“内容 div”。contentHeight 由 itemHeight 乘以 itemCount 计算而来，代表的是所有 item 组成的高度。我们把它放着这里，是为了让 “容器 div” **产生正确的滚动条**。

内容 div 下是我们的 items，以及开头的 **一个将 items 往下推到正确位置的空元素**，可以看作是一种 padding-top。它的高度值 top 由 itemHeight 乘以 startIdx 计算而来。

然后是监听滚动事件，当 scrollTop 改变时，更新组件。我这里使用的是 React18，默认是并发模式，更新状态 setState 是异步的，因此在快速滚动的情况下，会出现渲染不实时导致的短暂空白现象。

所以这里我用了 ReactDOM 的 flushSync 方法，让状态的更新变成同步的，来解决短暂空白问题。

但滚动是一个高频触发的时间，我的这种写法在列表项复杂的情况下，是可能会出现性能问题的。更好的做法是做 **函数节流 + RAF**（requestAnimationFrame），虽然也会有一些空白现象，但不会太严重。

列表项高度动态
-------

列表项高度动态的情况，就复杂得多。

如果能够 **在渲染前知道所有列表项的高度**，那实现思路还是同前面列表项高度固定的情况一致。

只是我们不能用乘法来计算了，要改成累加的方式来计算 startIdx 和 endIdx。

然而实际上更常见的情况是列表项 **高度根据内容自适应**，只能在渲染完成后才能知道真正高度。

怎么办呢？通常的方式是 **提供一个列表项预设高度，在列表项渲染完成后，再更新高度**。

### 代码实现

我们先给出实现：

```jsx
import { forwardRef, useState } from 'react';
import { flushSync } from 'react-dom';

// 动态列表组件
const VariableSizeList = forwardRef(
  ({ containerHeight, getItemHeight, itemCount, itemData, children }, ref) => {
    ref.current = {
      resetHeight: () => {
        setOffsets(genOffsets());
      }
    };

    // children 语义不好，赋值给 Component
    const Component = children;
    const [scrollTop, setScrollTop] = useState(0); // 滚动位置

    // 根据 getItemHeight 生成 offsets
    // 本质是前缀和
    const genOffsets = () => {
      const a = [];
      a[0] = getItemHeight(0);
      for (let i = 1; i < itemCount; i++) {
        a[i] = getItemHeight(i) + a[i - 1];
      }
      return a;
    };

    // 所有 items 的位置
    const [offsets, setOffsets] = useState(() => {
      return genOffsets();
    });

    // 找 startIdx 和 endIdx
    // 这里用了普通的查找，更好的方式是二分查找
    let startIdx = offsets.findIndex((pos) => pos > scrollTop);
    let endIdx = offsets.findIndex((pos) => pos > scrollTop + containerHeight);
    if (endIdx === -1) endIdx = itemCount;

    const paddingCount = 2;
    startIdx = Math.max(startIdx - paddingCount, 0); // 处理越界情况
    endIdx = Math.min(endIdx + paddingCount, itemCount - 1);

    // 计算内容总高度
    const contentHeight = offsets[offsets.length - 1];

    // 需要渲染的 items
    const items = [];
    for (let i = startIdx; i <= endIdx; i++) {
      const top = i === 0 ? 0 : offsets[i - 1];
      const height = i === 0 ? offsets[0] : offsets[i] - offsets[i - 1];
      items.push(
        <Component
          key={i}
          index={i}
          style={{
            position: 'absolute',
            left: 0,
            top,
            width: '100%',
            height
          }}
          data={itemData}
        />
      );
    }

    return (
      <div
        style={{
          height: containerHeight,
          overflow: 'auto',
          position: 'relative'
        }}
        onScroll={(e) => {
          flushSync(() => {
            setScrollTop(e.target.scrollTop);
          });
        }}
      >
        <div style={{ height: contentHeight }}>{items}</div>
      </div>
    );
  }
);
```

线上 demo：

https://codesandbox.io/s/4oy84f

效果：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2bb7052a4074321bc4d680d311eb9be~tplv-k3u1fbpfcp-zoom-1.image)

### 思路说明

和列表项等高的实现不同，这里不能传一个固定值 itemHeight，改为传入一个根据 index 获取列表项宽度函数 `getItemHeight(index)`。

组件会通过这个函数，来拿到不同列表项的高度，来计算出 offsets 数组。**offsets 是每个列表项的底边到顶部的距离**。offsets 的作用是在滚动到特定位置时，计算出需要渲染的列表项有哪些。

当然你也可以用高度数组，但查找起来并没有优势，你需要累加。offsets 是 heights 的累加缓存结果（其实也就是前缀和）。

假设几个列表项的高度数组 heights 为 `[10, 20, 40, 100]`，那么 offsets 就是 `[10, 30, 70, 170]`。一推导公式为：`offsets[i] = offsets[i-1] + heights[i]`

下面是计算 offsets 的代码：

```js
const genOffsets = () => {
  const a = [];
  a[0] = getItemHeight(0);
  for (let i = 1; i < itemCount; i++) {
    a[i] = getItemHeight(i) + a[i - 1];
  }
  return a;
};

// 所有 items 的位置
const [offsets, setOffsets] = useState(() => {
  return genOffsets();
});
```

getItemHeight 在列表项能渲染前，会提供一个预估高度 estimatedItemHeight。

```js
// 高度数组，当列表项渲染完成时，更新它
const heightsRef = useRef(new Array(100));
// 预估高度
const estimatedItemHeight = 40;

const getHeight = (index) => {
  return heightsRef.current[index] ?? estimatedItemHeight;
};
```

这里我用 genOffsets 函数生成了一个完整的 offsets 数组。

其实，我们也可以考虑做 **惰性计算**：一开始不计算出整个 offsets ，而是只计算前几个 item 的 offset，并通过这几个高度来推测一个总内容高度。然后在后面滚动时再一点点补充 offset，再一点点修正总内容高度。

为了让调用者可以手动触发高度的重新计算。虚拟列表组件通过 ref **提供了一个 resetHeight 方法来重置缓存的高度**。

```jsx
ref.current = {
  resetHeight: () => {
    setOffsets(genOffsets());
  }
};

// 使用方式
<VariableSizeList ref={listRef} />
listRef.current.resetHeight();
```

计算出 offsets 数组后，我们就可以计算需要渲染的列表项的起始（startIdx）和结束（endIdx）位置了。

因为 offsets 是有序数组，我们需要用 **高效的二分查找** 去查找，时间复杂度为 `O(log n)`。

（这里我偷懒直接用了从左往右查找，没有去做二分查找的实现）

```jsx
// 找 startIdx 和 endIdx
// 这里偷懒用了普通的查找，最好的方式是二分查找
let startIdx = offsets.findIndex((pos) => pos > scrollTop);
let endIdx = offsets.findIndex((pos) => pos > scrollTop + containerHeight);
if (endIdx === -1) endIdx = itemCount;

// 上下扩展补充几个 item
const paddingCount = 2;
startIdx = Math.max(startIdx - paddingCount, 0); // 处理越界情况
endIdx = Math.min(endIdx + paddingCount, itemCount - 1);
```

然后内容高度就是：

```jsx
// 计算高度
const contentHeight = offsets[offsets.length - 1];
```

需要渲染的 items：

```jsx
const items = [];
for (let i = startIdx; i <= endIdx; i++) {
  // 计算到顶部距离
  const top = i === 0 ? 0 : offsets[i - 1];
  // item 的高度
  const height = i === 0 ? offsets[0] : (offsets[i] - offsets[i - 1]);
  items.push(
    <Component
      key={i}
      index={i}
      style={{
        position: 'absolute',
        left: 0,
        top,
        width: '100%',
        height
      }}
      data={itemData}
    />
  );
}
```

后面的 div 结构和前面的列表项高度固定实现的基本一样，但我这里换成了绝对定位实现。就不过多赘述了。

```jsx
return (
  <div
    style={{
      height: containerHeight,
      overflow: 'auto',
      position: 'relative'
    }}
    onScroll={(e) => {
      flushSync(() => {
        setScrollTop(e.target.scrollTop);
      });
    }}
  >
    <div style={{ height: contentHeight }}>{items}</div>
  </div>
);
```

### 一些需要注意的问题

1.  容器宽度变化时，会导致大量列表项的高度变化，需要手动触发重置虚拟列表缓存的高度集合，建议宽度固定；
    
2.  图片加载需要时间，尤其是图片多的情况下，会让一个列表项的高度不断变大，需要你手动触发重置虚拟列表高度。可以考虑给图片预设一个宽高，在加载前占据好高度；
    
3.  因为预估高度并不准确，会导致内容高度一直变化。这就是拖动滚动条进行滚动时，滑块和光标位置慢慢对不上的原因。
    
4.  要考虑获取列表项的高度并更新虚拟列表高度的时机，可能需要配合 Obsever 监听变化；
    
5.  因为不是渲染所有列表项，所以像是 `.item:nth-of-type(2n)` 的 CSS 样式会不符合预期。你需要改成用 JS 根据 index 来应用样式，如`backgroundColor: index % 2 === 0 ? 'burlywood' : 'cadetblue'`。
    

结尾
--

虚拟列表的实现，核心在于根据滚动位置计算落在可视区域的列表项范围。

对于高度固定的情况，实现会比较简单，因为我们有绝对正确的数据。

对于高度动态的情况，就复杂得多，要在列表项渲染后才能得到高度，为此需要设置一个预估高度，并在列表项渲染之后更新高度。

本文中虚拟列表组件的 API 参考了 react-window 库。如果你需要在生产环境使用虚拟列表，推荐使用 react-window，它的功能会更强大。

我是前端西瓜哥，关注我，学习更多前端知识。

> 文章首发于我的公众号：前端西瓜哥
  

* * *

相关阅读，

[React 中的列表渲染为什么要加 key ？](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485439&idx=1&sn=b63e7872589c5c65594b457b9a3428da&chksm=e948c294de3f4b82589882f5e7aafb08f8611c641a7134f170cddef1eb7e022e4dc7a26416e4&scene=21#wechat_redirect)  

[实现一个自定义 React Hook：useLocalStorageState](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485091&idx=1&sn=d3530214753191c2a0ee4c4c12d61170&chksm=e948c3c8de3f4ade6703e09c24a18fed3ef298c40bf6fcd280b23aa00d3d149d350407750c45&scene=21#wechat_redirect)  

[如何写自定义 React Hook？](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484303&idx=1&sn=d1c89a7291d4c5810b21098ae7af82aa&chksm=e948c6e4de3f4ff25be4361b5774c4ef9917c7e7c2b4888b7750e4d6c5abe324fd2fffe9130b&scene=21#wechat_redirect)  


