
# HTTP 头字段 Origin、Host 和 Referer 有什么区别？

大家好，我是前端西瓜哥。

HTTP 请求头字段中的 Origin、Host 和 Referer 非常相似，乍一看都是域名相关的值，非常容易弄混。我在面试中也被问过，因为没准备好而哑口无言。

今天西瓜哥我来带领大家学习这三个头字段，务必学完后能好好分清楚它们。

Origin
------

Origin 由三部分组成：

1.  scheme：协议，如 `http`、`https`。
    
2.  host：域名或 IP 地址。如 `127.0.0.1`、`juejin.cn`。
    
3.  port：端口，可选。如果省略，默认为当前协议的默认端口（如 HTTP 的 80、HTTPS 的 443）
    

这些内容会从请求 url 中提取，其他的部分会被丢弃掉。

此外，Origin 的值也可能为 null。

```
# 示例
Origin: http://a.com:8080
Origin: http://b.com
Origin: https://juejin.cn
Origin: null
```

**Origin 会在跨域请求时带上，服务端据此判断是否允许跨域**，是 CORS 机制的重要一环。

如何通过 CORS 让一个请求能够正常跨域比较复杂，可以看我写的这一篇文章：《浏览器跨域请求的机制：CORS》

**在非 GET 和 HEAD 方法的同源请求中，浏览器也会加上 Origin**。西瓜哥对此不太理解，为什么同源也要加 Origin。我觉得对于同源请求，要么都别加 Origin，要么就全都加上。

Host
----

Host 由两部分组成：

1.  host：域名或 IP 地址
    
2.  port：端口，可选项。
    

```
# 示例
Host: a.com:5500
Host: a.com
```

在 HTTPS 下，你在浏览器的开发者工具可能会看到这个玩意：`:authority`。这是 HTTP2 协议中定义的伪头字段，向后兼容 HTTP1，对应 Host。

Host 可以用于代理，当多个域名指向同一个 IP 时，Web Server 可以通过 Host 来识别并提供不同的服务。

如下面的 Nginx 配置就是将 `blog.fstars.wang` 和 `static.fstars.wang` 做了代理，虽然都指向同一台机器，但可以根据 Host 提供两套独立的服务。

```
server {
    # 博客页面
    server_name  blog.fstars.wang;
    location / {
        proxy_pass   http://localhost:3000;
    }
}

server {
    # 图片等资源
    server_name  static.fstars.wang;
    location / {
        root   /www/static/;
    }
}
```

Referer
-------

当前请求的来源页面。

值为 **来源页面 url 移除掉 fragment 和 userinfo 后的结果**。

fragment 就是锚点，比如 `https://blog.fstars.wang/posts/what-is-bezier-curve-and-draw-by-canvas/#chapter1` 的 `#chapter1` ，它表示打开页面后，滚轮定位到的位置。

userinfo 则是用户的信息，如  `https://username:password@example.com/foo/bar/` 中的 `username:password`。

fragment 代表的页面滚动位置比较多余，userinfo 则是敏感信息，故而会被丢弃。

下面看看不同情况下会怎么携带 Referer

从页面 `https://nginx.org/` 跳转到 `https://nginx.org/2021.html` 的时候，请求页面 url 时，就会带上

```
Referer: https://nginx.org/

```

对于页面中的图片来说，则带上当前页面的 url。

所以可以用来做图片防盗链，当 Referer 不在白名单中，就返回 403，或返回一个比较小的 “你盗我的图了” 的图片，或重定向到不要自己钱的公域图片上。

结尾
--

简单总结一下：

*   Origin：协议+域名+端口，主要用于跨域。
    
*   Host：域名+端口，HTTP2 对应字段为 :authority，主要用于服务器区分服务。
    
*   Referer：去掉 fragment（锚点）和 userinfo（用户信息）的 url，用于确认请求的来源页面。
    

我是前端西瓜哥，一名喜欢分享的前端开发，最近在学些 HTTP 知识，欢迎关注我。

  
> 本文首发于我的公众号：前端西瓜哥