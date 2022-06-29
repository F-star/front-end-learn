module.exports = {
  title: '前端系列文章',
  description: '关于前端的文章，包括面试、算法、源码等',
  themeConfig: {
    sidebar: [
      {
        title: 'JavaScript',
        path: '/js',
        collapsable: false, // 可选的, 默认值是 true,
        // sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          'js/what-is-event-loop',
          'js/parseint-and-map'
        ]
      },
      {
        title: 'HTML/CSS',
        path: '/html-css',
        collapsable: false,
        // sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          'html-css/box-sizing'
        ]
      }
    ]
  }
}