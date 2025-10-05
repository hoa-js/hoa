## @hoajs/compress

Provide response compression (gzip/deflate) for Hoa, brotli (br) is not supported now.

## Quick Start

```js
import { Hoa } from 'hoa'
import { compress } from '@hoajs/compress'

const app = new Hoa()
app.use(compress())

app.use(async (ctx) => {
  ctx.res.body = 'Hello, Hoa!'
})

export default app
```

## Options

```ts
interface CompressionOptions {
  encoding?: 'gzip' | 'deflate'
  threshold?: number // default 1024 bytes
}
```

- encoding: Compression encoding.
  - When not set, the encoding is selected based on the client's Accept-Encoding (gzip first, then deflate). If the client does not provide Accept-Encoding or it is empty, compression is skipped.
  - When set, the specified encoding is used regardless of the client's Accept-Encoding.
- threshold: Compression threshold in bytes. Default is 1024. Responses smaller than the threshold will not be compressed.

## Examples

```js
// Select encoding based on client negotiation
app.use(compress())

// Force deflate, ignoring Accept-Encoding
app.use(compress({ encoding: 'deflate' }))

// Set threshold to 4KB
app.use(compress({ threshold: 4 * 1024 }))
```
