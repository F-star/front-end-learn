# 前端性能优化：启用 gzip

大家好，我是前端西瓜哥。今天带大家学习如何启用 gzip 来做前端性能优化。

### HTTP 上的 gzip

gzip 是一种优秀的压缩算法，我们可以在 HTTP 请求上对一些文本文件，设置 gzip 压缩。

服务端将响应头设置上 `Content-encoding: gzip`，表示当前资源会使用 gzip 压缩，提示客户端解压使用。

当然前提是客户端支持该压缩算法，服务端会通过客户端发送的请求头中的 `Accept-Encoding` 字段来确定是否支持。

![CyENL1](https://fe-watermelon.oss-cn-shenzhen.aliyuncs.com/CyENL1.jpg)

只对文本文件进行压缩，是因为文本类压缩效果好，而图片视频这些文件则本身就是进行压缩过的，压缩起来不仅效果差，还因为体积大耗费时间。

我用我自己的网站 `https://frontend.fstars.wang`  做了测试。

开启 gzip 前 index.html 大小为 8.4 KB：

![6BXqPY](https://fe-watermelon.oss-cn-shenzhen.aliyuncs.com/6BXqPY.jpg)

开了 gzip 后减小为 2.7 KB：

![h3P6E8](https://fe-watermelon.oss-cn-shenzhen.aliyuncs.com/h3P6E8.jpg)

你还可以对比图片上其他资源 gzip 压缩前后的大小变化，提升还是相当可观的。我能够感觉到加载确实快了一些的。

Nginx 上开启 gzip
--------------

Nginx 默认是不开启 gzip 的，你需要这样设置：

```nginx
http {
  # 开启 gzip 压缩
  gzip  on;

  # 使用 gzip 压缩的文件类型
  # 此外，text/html 是自带的，不用写上
  gzip_types text/plain text/css application/javascript application/json text/xml application/xml application/xml+rss;
  
  # 小于 256 字节的不压缩
  # 这是因为压缩是需要时间的，太小的话压缩收益不大
  gzip_min_length 256;
  
  # 开启静态压缩
  # 压缩的资源会被缓存下来，下次请求时就直接使用缓存
  gzip_static  on;
}
```

结尾
--

绝大多数的网站都对文本文件做了 gzip 压缩传输处理，降低了带宽压力，也让用户能够更快地加载资源，属于是一个非常基础的前端性能优化了。

如果你也部署了自己的个人网站，快去看看你是否正确地开启了 gzip。

我是前端西瓜哥，欢迎关注我，学习更多前端知识。


* * *

相关阅读，

[HTTP 缓存策略：强缓存和协商缓存](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484833&idx=1&sn=b6be3d82b822bd0d46c3c38c67564713&chksm=e948c0cade3f49dc6ca39d4a8f326192c958ad40589ed403a2451cfa16664cc42d8b36a0f02e&scene=21#wechat_redirect)  

[HTTP 中的常用状态码及使用场景](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485622&idx=1&sn=d9b00fd88ccf04738fbe0bc43e18def0&chksm=e948cdddde3f44cbf725cfb25c243d73035e09305ee831fa488754ec9f28924d6d017ec406fa&scene=21#wechat_redirect)  

[响应报文中的 Vary 头字段的作用](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484712&idx=1&sn=4ceaf8d22a5d952e056b6d8a44eeaabc&chksm=e948c043de3f49556063f4d49e7038f63c587a7349b47582d106c5303ca15facf6f79ad48004&scene=21#wechat_redirect)  

> 文章首发于我的个人公众号：前端西瓜哥