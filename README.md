## Hoa

Hoa is a minimal Web framework inspired by [Koa](https://github.com/koajs/koa) and [Hono](https://github.com/honojs/hono), built entirely on Web Standards. It runs seamlessly on any modern JavaScript runtime: Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, AWS Lambda, Lambda@Edge, and Node.js.

## Features

- ⚡ Minimal - Only ~4.4KB (gzipped).
- 🚫 Zero Dependencies - Built on modern Web Standards with no external dependencies.
- 🛠️ Highly Extensible - Features a flexible extension and middleware system.
- 😊 Standards-Based - Designed entirely around modern Web Standard APIs.
- 🌐 Multi-Runtime - The same code runs on Cloudflare Workers, Deno, Bun, Node.js, and more.
- ✅ 100% Tested – Backed by a full-coverage automated test suite.

## Installation

```bash
npm i hoa --save
```

## Quick Start

```js
import { Hoa } from 'hoa'
const app = new Hoa()

app.use(async (ctx, next) => {
  ctx.res.body = 'Hello, Hoa!'
})

export default app
```

## Documentation

The documentation is available on [hoa-js.com](https://hoa-js.com)

## Contributing

Contributions Welcome! You can contribute in the following ways.

- Create an Issue - Propose a new feature. Report a bug.
- Pull Request - Fix a bug and typo. Refactor the code.
- Create third-party middleware.
- Share your thoughts on the Blog, X, and others.
- Make your application.

## License

Distributed under the MIT License.
