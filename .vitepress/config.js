import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Hoa',
  description: 'A minimal web framework built on Web Standards',
  srcDir: './docs',
  sitemap: {
    hostname: 'https://hoa-js.com'
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],

    sidebar: [
      {
        text: 'What is Hoa?',
        link: '/what-is-hoa'
      },
      {
        text: 'API',
        items: [
          { text: 'Hoa', link: '/api/hoa' },
          { text: 'HoaContext', link: '/api/context' },
          { text: 'HoaRequest', link: '/api/request' },
          { text: 'HoaResponse', link: '/api/response' },
        ]
      },
      {
        text: 'Adapter',
        items: [
          { text: 'Node.js', link: '/adapter/node.md' },
        ]
      },
      {
        text: 'Middleware',
        items: [
          { text: 'Basic Authentication', link: '/middleware/basic-auth' },
          { text: 'Body Parser', link: '/middleware/body-parser' },
          { text: 'Cache', link: '/middleware/cache' },
          { text: 'Compress', link: '/middleware/compress' },
          { text: 'Context Storage', link: '/middleware/context-storage' },
          { text: 'CORS', link: '/middleware/cors' },
          { text: 'CSRF', link: '/middleware/csrf' },
          { text: 'Etag', link: '/middleware/etag' },
          { text: 'JSON Format', link: '/middleware/json' },
          { text: 'JWT', link: '/middleware/jwt' },
          { text: 'Logger', link: '/middleware/logger' },
          { text: 'Method Override', link: '/middleware/method-override' },
          { text: 'Request ID', link: '/middleware/request-id' },
          { text: 'Response Time', link: '/middleware/response-time' },
          { text: 'Router', link: '/middleware/router' },
          { text: 'Timeout', link: '/middleware/timeout' },
        ]
      },
      {
        text: 'Example',
        items: [
          { text: 'Temp Note', link: 'https://github.com/hoa-js/examples/tree/master/tempnote' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hoa-js/hoa' }
    ]
  }
})
