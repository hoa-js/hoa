<div align="center">
  <a href="https://hoa-js.com">
    <img src="https://raw.githubusercontent.com/hoa-js/website/master/logo.png" width="400" height="400" alt="Hoa"/>
  </a>
</div>

[![NPM version](https://img.shields.io/npm/v/hoa)](https://npmjs.org/package/hoa)
[![Build status](https://img.shields.io/github/actions/workflow/status/hoa-js/hoa/ci.yml?branch=master)](https://github.com/hoa-js/hoa/actions)
[![Codecov](https://img.shields.io/codecov/c/github/hoa-js/hoa/master)](https://app.codecov.io/gh/hoa-js/hoa/tree/master)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/hoa)](https://bundlephobia.com/result?p=hoa)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://github.com/hoa-js/hoa/blob/master/package.json)
[![License](https://img.shields.io/github/license/hoa-js/hoa)](https://github.com/hoa-js/hoa/blob/master/LICENSE)

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
