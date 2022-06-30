module.exports = {
  title: '西瓜哥的前端面试题系列',
  description: '前端相关的文章，包括面试、算法、源码等',
  plugins: [
    ['vuepress-plugin-auto-sidebar', {
      title: {
        mode: "uppercase"
      }
    }]
  ],
  themeConfig: {
    nav: [
      { text: 'JavaScript', link: '/js/' },
      { text: 'HTML/CSS', link: '/html-css/' },
      { text: '计算机网络', link: '/network/' },
      { text: '算法', link: '/algorithm/' },
      {
        text: '教程',
        ariaLabel: 'Language Menu？',
        items: [
          { text: 'konva', link: '/tutorial/konva/' },
        ]
      },
      { text: '关于我', link: '/' },
    ],
    /* sidebar: {
      '/js/': [
        'what-is-event-loop',
        'parseint-and-map',
        'get-random-integer-in-range',
        'js-async-traversal',
      ],
      '/html-css/': [
        'box-sizing',
      ],
      '/network/': [
        'cookies-props',
        'http-cache',
      ],
    } */
  }
}