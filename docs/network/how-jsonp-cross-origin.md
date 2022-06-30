# JSONP 是如何实现跨域的？

大家好，我是前端西瓜哥。今天讲 JSONP。

JSONP，是 JSON with Padding 的缩写，字面上的意思就是 “填充 JSON”。JSONP 是解决跨域请求的一种方案，我们先了解下跨域请求是什么。

跨域
--

浏览器在跨域发送 Ajax/fetch 请求时，会触发浏览器的同源策略，导致请求失败。

只要协议、域名、端口有一个不同，那浏览器就会认为是跨域。比如你在 `a.com` 下通过 Ajax 请求 `b.com/api/book`，默认情况下就被浏览器拦截，导致无法获得返回数据。

具体跨域的知识点，可以看我的这篇文章《[为什么浏览器不能跨域发送 ajax 请求？](https://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484723&idx=1&sn=b92f7c532a04c2328f081e0b789d8d83&chksm=e948c058de3f494e9877377f359cbff31a3dfe103200e0d768b1f44511d99df24f28c3feeff0&scene=21#wechat_redirect)》

JSONP 怎么跨域？
-----------

既然 Ajax 不能发送跨域请求，那我们不用 Ajax，改用 script 标签。

HTML 下的 script 标签会指向一个脚本地址，这个地址**允许跨域**，浏览器会加载这个脚本然后执行。

> 除了 script 标签， link、img 等标签的请求也是允许跨域的。

下面以通过用户 id 获取用户信息为例。

前端实现
--

在 script 标签的 src 上，我们指定好需要服务器进行填充的回调函数名 setUser，并带上用户 id。

```
<script src="http://b.com:4000/user?id=2&callback=setUser"></script>

```

上面这种直接这样写到 HTML 里不太灵活，我们改写成下面这样。

```js
let user = null;

function setUser(user) {
  // 保存用户信息
  window.user = user;
  
  // 输出到页面上，看看效果。
  document.body.append(
    JSON.stringify(user);
  );
}

function getUserById(id) {
  const script = document.createElement('script');
  script.src = `http://b.com:4000/user?id=${id}&callback=setUser`;
  document.body.appendChild(script);
}

document.querySelector('button').onclick = function() {
  getUserById(2);
}
```

后端实现
--

然后是服务端的处理，这里我用了 Nodejs 的 Express 框架。

```js
const app = express();

// ...

const map = {
  1: { name: 'fe_watermelon' },
  2: { name: '前端西瓜哥' }
};

// 例子：/user?id=2&callback=setUser
app.get('/user', (req, res, next) => {
  const { id, callback } = req.query;
  res.send(`${callback}(${JSON.stringify(map[id])})`);
});

// ...

```

服务端从 url 的请求字段中提取出 id ，找到对应的用户信息（通常为 JSON 的形式），配合要填充的回调函数 setUser，组装成字符串  `setUser({"name":"前端西瓜哥"})`

这个内容会作为脚本内容返回给前端，前端运行这个脚本后，就会执行全局作用域下的 setUser 函数，这个函数还会拿到用户信息，将其保存下来。

演示效果

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/742cc7e749154f85b122b97cee85000b~tplv-k3u1fbpfcp-zoom-1.image)

结尾
--

JSONP 是一种解决跨域的方案，但一般比较少用到。

因为 JSONP 并不是标准，也不安全，服务端代码没写好会有代码注入的风险，且无法防范跨站请求伪造（CSRF）攻击。

我们也注意到要兜住返回的数据，必须定义一个全局的函数，在如今主流的模块化（变量隔离在各个模块中不暴露到全局）写法下有点格格不入。

我是前端西瓜哥，喜欢写技术文章，欢迎关注我。

> 本文首发于我的公众号：前端西瓜哥
