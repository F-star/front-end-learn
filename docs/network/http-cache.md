# HTTP 缓存策略：强缓存和协商缓存

大家好，我是前端西瓜哥。今天讲一下 HTTP 缓存策略的强缓存和协商缓存。

缓存是什么？
------

缓存（Cache）是一种数据存储技术，广泛应用在电脑工程领域。

它将原本访问起来较慢的数据，放到访问更快的存储介质中，当第二次访问时，能够更快地访问数据，是一种 **空间换时间** 的做法。

比如，有个文件经常被读取，且很少改变，那我们就直接将其缓存到内存中，节省掉耗时的 IO 磁盘读取时间。

再比如，在写代码时，我们的一个方法会接受参数，然后计算返回一个结果，假设这个计算过程非常耗时，且结果值只依赖传入的参数。

那我们就可以将参数和结果的对应映射，保存到哈希表中，下次如果是相同参数，就能命中然后直接从哈希表里获取，速度有了极大提升。

HTTP 缓存也是一样的道理，用户通过 HTTP 请求访问的资源会缓存到本地，在用户第二次访问相同资源时，直接使用之前缓存的资源。

当然资源可能并不一定是不变的，在必要的时候需要更新缓存。为此我们可能需要设置一下缓存的有效期，或是发送一个占用带宽小的请求询问服务端等等。

这些，就是 **HTTP 缓存策略**。

强缓存
---

强缓存，指的是 **让浏览器强制缓存服务端提供的资源**。

“东西就给你了，没事别找我。”

`Cache-Control: max-age=<seconds>`
----------------------------------

响应头字段 Cache-Control，通过设置 `max-age=<seconds>`，可以规定资源的缓存有效时间长度，单位为秒。

> 
> 
> 需要注意的是 Cache-Control 是通用头字段，请求头和响应头中都可以使用。
> 
> 响应头字段的 Cache-Control 用于告知客户端如何缓存资源。
> 
> 客户端的 Cache-Control 则是告知服务器需要多新鲜的资源，比如 no-cache 或 max-age=0 表示要最新鲜的资源。
> 

```
Cache-Control: max-age=31536000

```

在浏览器 devtool 的 network 面板，我们看到 `from disk cache` 的字样，代表这个资源并没有去发送请求，而是使用了来自硬盘的缓存。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11fa7adb65cc470a8b16e0d742082eb3~tplv-k3u1fbpfcp-zoom-1.image)

如果你**不停地刷新页面**，你还会看到 `from memory cache` ：来自内存的缓存。因为刷新前资源正在使用，还在内存中，刷新后浏览器就直接从内存中取出来了。

当你**强制刷新**时，浏览器会在请求头中加上 `Cache-Control: no-cache` 或是 `Cache-Control: max-age=0`，要求服务端返回最新资源。

Expires
-------

`Cache-Control: max-age=<seconds>` ，是缓存的有效时长。

当看到一个叫 max-age（有效时长）的东西时，我们经常会发现它的孪生兄弟：Expires（过期时间点）。如果你熟悉 Cookies，你会发现 Cookies 也有这么一对属性。

```
Expires: Wed, 21 Oct 2015 07:28:00 GMT

```

Expires 使用的 GMT 格式的时间戳字符串。

当 max-age 和 Expires 都存在时，使用 max-age。这点和 Cookies 一样。

强缓存，就是让浏览器将资源缓存下来，在缓存过期前，不发送请求获取新资源，而是直接使用本地资源。

协商缓存
----

协商缓存，是**在缓存过期的情况下，客户端和服务端协商，确认客户端缓存是否需要更新**。

Last-Modified 和 If-Modified-Since
---------------------------------

响应头字段 Last-Modified 表示提供的资源最后被修改的时间。值是 GMT 格式的字符串。

```
Last-Modified: Sat, 09 Apr 2022 14:47:36 GMT

```

这个时间会标记在对应缓存上，**起到标识的作用**。

当浏览器的缓存失效后，会再次请求服务端，并带上 If-Modified-Since 请求头字段，它的值就是之前 Last-Modified 带过来的值。

```
If-Modified-Since: Sat, 09 Apr 2022 14:47:36 GMT
```

当服务端发现资源最后修改时间和  If-modified-since 值相等，代表资源从该时间后再未改变过。

服务端于是返回 304（Not Modified）状态码，表示资源没有改变，并且响应体为空。浏览器拿到后，就知道原本可能过期的缓存其实还可以继续使用。

如果资源改变了，就会返回 200，且响应体带上最新资源。

ETag 和 If-None-Match
--------------------

除了用 Last-Modified 代表的资源最后修改时间作为标识，我们还可以使用 ETag 响应头。

ETag 的值没有规定，你可以是时间戳的哈希值，也可以是版本号。

另外 ETag 分为强 ETag 和弱 ETag，其中弱 ETag 以为 W/ 开头。

```
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
ETag: W/"0815"
```

然后和 If-Modified-Since 一样，当缓存过期时，客户端会在请求头带上 If-None-Match 去请求资源。

```
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

如果资源依旧新鲜，则返回 304，客户端继续复用本地资源。

结尾
--

强缓存，设置一个过期时间，让客户端在过期前使用本地缓存，直到过期才请求更新鲜的资源。涉及的头字段有 `Cache-Control: max-age=<seconds>`  或 `Expires` 。

协商缓存，在客户端缓存过期的情况下，和服务端协商一下，是否可以继续使用本地缓存。涉及的头字段有 `Last-Modified / If-Modified-Since` 和 `ETag / If-None-Match`。

不过需要注意的是，这些都只是规范，我们无法确定客户端或服务端在实现上完全遵循，而且可能在版本更新中会出现一些 bug。

所以对于发生变化的文件，我更倾向于**给文件名加上哈希串**。毕竟，访问一个从来没访问过的资源，客户端是不会有缓存的。这样就能绕开缓存机制，真正拿到最新资源，而不会掉入缓存陷阱。

参考
--

*   RFC7234 - Request Cache-Control Directives：https://www.rfc-editor.org/rfc/rfc7234#section-5.2.1
    
*   RFC7232 - Weak versus Strong：https://www.rfc-editor.org/rfc/rfc7232#section-2.1
    
*   stackoverflow - What takes precedence: the ETag or Last-Modified HTTP header?：https://stackoverflow.com/questions/824152/what-takes-precedence-the-etag-or-last-modified-http-header
    

相关文章
----

*   [面试官：Cookies 的属性有哪些？](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484763&idx=1&sn=48abf50ca3e3c57293476efd441880c1&chksm=e948c030de3f4926a1b54d66fc16977be87ed8ab6ba6fd5e74a66650b91fa34b829ab85e3294&scene=21#wechat_redirect)  
    
*   [HTTP 头字段 Origin、Host 和 Referer 有什么区别？](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484771&idx=1&sn=913a523a795408927bbd8979776b01ae&chksm=e948c008de3f491e8658cd8ef1ad5e0bd340c78a91367f2436ddc0cefd28bb8fa347206bdddb&scene=21#wechat_redirect)  
    
*   [浏览器跨域请求的机制：CORS](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484744&idx=1&sn=781e17e26c6dc0bbbdc162f0b0912f80&chksm=e948c023de3f493511f10a1808dd8b84b3ea97c8f75b0bd9b27a5f1dbc9654fd37e25fdbdf2f&scene=21#wechat_redirect)
    
*   [响应报文中的 Vary 头字段的作用](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484712&idx=1&sn=4ceaf8d22a5d952e056b6d8a44eeaabc&chksm=e948c043de3f49556063f4d49e7038f63c587a7349b47582d106c5303ca15facf6f79ad48004&scene=21#wechat_redirect)  
    
      
> 首发于我的公众号：前端西瓜哥