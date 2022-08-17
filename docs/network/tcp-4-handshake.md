# 你需要知道的 TCP 四次挥手

大家好，我是前端西瓜哥。今天给大家说说 TCP 的四次挥手。

建立 TCP 连接一段时间后，如果要断开 TCP 连接，就会进行 TCP 四次挥手过程完成断开操作。

TCP 四次的过程有点像 TCP 建立连接的三次握手。关于三次握手，可以看我的这篇文章：《[你需要知道的 TCP 三次握手](https://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485502&idx=1&sn=7cfec46265144a0da8fb3a5b5bfbc7fa&chksm=e948cd55de3f444311806b460db25dc4b0b8a5a921d5ce6b01fb42ea15280720a264be95d80f&token=2084731007&lang=zh_CN&scene=21#wechat_redirect)》

下图为 TCP 头部的结构，我们的 TCP 四次挥手主要用到其中的标黄的部分。

![RcLk1n](https://fe-watermelon.oss-cn-shenzhen.aliyuncs.com/RcLk1n.jpg)

**和三次握手的发起者必须是客户端不同，断开 TCP 连接的发起方可以是任何一方**。为了方便讲解，下面我们以客户端作为发起者进行描述。

TCP 四次挥手过程
----------

我们先看示意图。

![EJ9xQY](https://fe-watermelon.oss-cn-shenzhen.aliyuncs.com/EJ9xQY.jpg)

**第一次挥手**，客户端向服务端发送 TCP 请求，将 TCP 头部中的

1.  FIN 设置为 1
    
2.  seq 设置为一个随机数 x
    

FIN 是一个标志位，表示结束（finish）的意思，1 等同于 true。

seq 是个序列号，一个装数据的地方，我们这里给他设置为一个随机数，用于给服务端做确认，好对应上这个 TCP 请求。

**第二次挥手**，服务端发送 TCP，并将 TCP 头部中的

1.  ACK 设置为 1（acknowledge，表示 “收到” 的意思）
    
2.  ack 确认号设置为 x+1（x 来自第一次挥手）
    

当客户端收到这个 TCP 请求时，表示从客户端到服务端的通道已经关闭，你不能再向服务端发正常的数据请求了。

此时服务端到客户端还是可以发送数据的。如果服务端有一些之前的 TCP 请求没来得及响应，在第二次挥手和第三次挥手期间还是可以去返回的。

**第三次挥手**，服务端向客户端发送 TCP 请求：

1.  FIN 设置为 1
    
2.  seq 设置为一个随机数 y
    

类似第一次挥手，只是这次发送方为服务端。

**第四次挥手**，客户端向服务端发送 TCP 请求：

1.  ACK 设置为 1
    
2.  ack 确认号设置为 y+1
    

服务端接收到这个请求后，服务端就能成功变成关闭（CLOSE）状态。客户端则会等一段时间再进入关闭状态，因为第四次挥手不一定能成功发给服务端，所以要等一下，看看服务端会不会因为没收到第四次挥手，而重发第三次挥手。

结尾
--

和 TCP 三次握手不同。TCP 关闭连接的挥手足足有四次。这是因为第二次挥手和第三次挥手之间可能有一些服务端需要发送的处理比较慢的数据要返回，所以没有将这两次挥手合并。

我是前端西瓜哥，欢迎关注我，掌握更多前端知识。

  

* * *

相关阅读，

[你需要知道的 TCP 三次握手](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485502&idx=1&sn=7cfec46265144a0da8fb3a5b5bfbc7fa&chksm=e948cd55de3f444311806b460db25dc4b0b8a5a921d5ce6b01fb42ea15280720a264be95d80f&scene=21#wechat_redirect)  

[HTTP 缓存策略：强缓存和协商缓存](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484833&idx=1&sn=b6be3d82b822bd0d46c3c38c67564713&chksm=e948c0cade3f49dc6ca39d4a8f326192c958ad40589ed403a2451cfa16664cc42d8b36a0f02e&scene=21#wechat_redirect)  

[HTTP 中的常用状态码及使用场景](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247485622&idx=1&sn=d9b00fd88ccf04738fbe0bc43e18def0&chksm=e948cdddde3f44cbf725cfb25c243d73035e09305ee831fa488754ec9f28924d6d017ec406fa&scene=21#wechat_redirect)  

[浏览器跨域请求的机制：CORS](http://mp.weixin.qq.com/s?__biz=MzI0NTc2NTEyNA==&mid=2247484744&idx=1&sn=781e17e26c6dc0bbbdc162f0b0912f80&chksm=e948c023de3f493511f10a1808dd8b84b3ea97c8f75b0bd9b27a5f1dbc9654fd37e25fdbdf2f&scene=21#wechat_redirect)  

  
> 文章首发于我的公众号：前端西瓜哥