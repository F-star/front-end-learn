
# Cookies 的属性有哪些？

大家好，我是前端西瓜哥。今天来学习一下 Cookie 的属性有哪些？以及有什么作用？

Cookies 是浏览器本地保存数据的一种方案，且会在每次请求中带上该字段。

cookie 最常见的用法是作为用户登录凭证，赋予原本没有状态的 HTTP 协议以一种状态，让识别一个请求是哪一个用户发出成为可能。

HTTP 响应报文通过 Set-Cookie 头字段给浏览器给当前网站设置 cookie：

```http
HTTP/1.1 200 OK
Set-Cookie: lang=en-US; Path=/
Set-Cookie: token=abcd; Max-Age=6000; Path=/; Expires=Thu, 28 Apr 2022 16:31:36 GMT; HttpOnly
```

当然也可以在浏览器用 JS 脚本通过 `document.cookie` 或 `CookieStore` 来设置 cookie。

浏览器拿到 cookie 后，会将它们保存下来，在下一次请求时将这些 cookie 全放到 Cookie 请求头中，并用分号分隔：

```http
GET / HTTP/1.1
Cookie: lang=en-US; token=abcd
```

需要特别注意的是，**Cookie 的作用域是和 domain（域名或 ip）绑定的，端口无关**。

你问我怎么知道的？因为我本地开发时用 localhost 加上各种端口，结果任意一个端口的请求都会将其他所有端口的 cookie 给我带上，真的是离谱。

那么和协议（http: 以及 https:）有关吗？答案是：以前是和协议无关的，但近几年标准发生了改变，不同浏览器支持程度不同，可以看看下面这篇文章：

https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#browser\_compatibility

下面我们看看 cookie 的一些属性。

cookieName=cookieValue
----------------------

```http
Set-Cookie: token=abcd
```

设置 cookie 的名字和值，必填项。

HttpOnly
--------

```http
Set-Cookie: token=abcd; HttpOnly
```

设置后，只能通过 HTTP 响应报文的 Set-Cookie 来新增或更新 cookie ，客户端无法通过脚本的方式来读写 cookie。

对于敏感信息比如用户凭证，请一定要加上 HttpOnly。如果攻击者成功地实施了 XSS 攻击，会因为无法读取 cookie 而拿不到敏感信息。

Expires
-------

```http
Set-Cookie: token=abcd; Expires=Fri, 29 Apr 2022 05:29:01 GMT
```

cookie 的过期时间点，使用了 GMT 时间格式的字符串。

值必须符合下面格式：

```http
<day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
```

Max-Age
-------

```http
Set-Cookie: token=abcd; Max-Age=6000
```

cookie 的有效时间长度，单位为秒。通过设置小于等于 0 的数字，可以让一个 cookie 失效。

如果 Max-Age 和 Expires 同时存在，以 Max-Age 为准。

如果 Expires 和 Max-Age 都没设置，cookie 的有效期就会设置为 `session`， 一种临时会话状态，会在浏览器关闭时销毁。不过也不总是这样，这个得看浏览器实现，总之不会保存太久就是了。

Path
----

```http
Set-Cookie: lang=en-US; Path=/user
```

设置 cookie 的路径作用域。

怎么理解？

我们以上面示例为例，浏览器会将名为 lang 的 cookie 保存到当前域名下。但之后请求时，会判断路径是否匹配 /user，来决定是否带上 cookie。

*   `/` ：不会带上名为 lang 的 cookie
    
*   `/user`：会带上
    
*   `/user/1`：会带上
    
*   `/user2`：不会带上
    

另外，需要注意的是，可能会有 Path 不同的复数个同名 cookie。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01d946810a394782b8ed102f5a16a8ab~tplv-k3u1fbpfcp-zoom-1.image)

如果请求路径都匹配上了，不同 Path 下的多个同名 cookie 都会被发送：  

```
GET /user HTTP/1.1
Cookie: lang=user-dir; lang=root
```

理论上，如果 Set-Cookie 没有指定 Path，就会被设置为当前请求的路径。不过实际用 Chrome 测试时，我发现都被设置为 `/` 了，看来浏览器也只是选择性遵守 HTTP 协议？

不过实际开发时我们都是直接使用 `Path=/`，简单粗暴覆盖所有路径，没有必要分路径，让事情变得复杂。上面的知识点，大家简单了解就好。

Domain
------

```
Set-Cookie: lang=en-US; Domain=.a.com
```

设置 cookie 的 domain 作用域。

在不提供该属性的情况下，会使用请求时的 domian，比如 `http://www.a.com/api/v1/books` 不设置 Domain 时，拿到的 cookie 的 Domain 属性会被设置为 `www.a.com` 。

通常我们会省略掉 Domain 属性。

但在希望多个子域名共享 cookie 的场景下，比如 `sub1.a.com` 和 `sub2.a.com`（或者再加上父域名 `a.com`），就需要显式将其设置为 `.a.com`。开头的小圆点可写可不写，都一样。

如果 Domain 不能覆盖当前域名，该 cookie 会被认定为无效，然后被丢弃掉。

Secure
------

```
Set-Cookie: token=en-US; Secure
```

该属性没有值，属性本身存在就代表**设置为安全模式**。

即请求必须为安全连接（HTTPS），cookie 才会被保存下来。HTTP 协议下，cookie 无效。

SameSite
--------

```
Set-Cookie: token=abcd; SameSite=Strict
```

cookie 在跨域时是否应该被发送。

*   Strict：跨域请求严禁携带本站 cookie。
    
*   Lax：默认值。可通过顶级导航的方式并使用 GET 请求发时可以携带（目前我没有通过 demo 实现该效果，或者我们可以将其无限接近于 Strict）。**在 Chrome 80 版本之后，Cookie 的 SameSite 由原来的 None 改为了 Lax。**
    
*   None：会携带 cookie。但前提是 Secure 设置为 true，即只能在 HTTPS 协议下使用（之前的标准没有这个要求）。
    

结尾
--

以上就是 Cookie 可以设置的所有属性，学废了吗？反正我是麻了。

我是前端西瓜哥，欢迎关注我，学习前端不迷路。

> 文章首发于我的公众号：前端西瓜哥

