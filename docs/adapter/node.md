## @hoajs/adapter

This package provides an adapter that lets a Hoa application run seamlessly on a Node.js HTTP server. Under the hood it uses `createServerAdapter` from `@whatwg-node/server` to bridge WHATWG Fetch–style Request/Response with Node's `http.Server`.

## Quick Start

```ts
import { Hoa } from 'hoa'
import { nodeServer } from '@hoajs/adapter'

const app = new Hoa()
app.extend(nodeServer())

app.use(async (ctx) => {
  ctx.res.body = 'Hello, Hoa!'
})

app.listen(3000, () => {
  console.log('Listening on 3000')
})
```

## app.listen

Hoa's `app.listen` delegates to Node's `server.listen(...)` and supports the same call signatures. See the official Node.js docs: [server.listen()](https://nodejs.org/docs/latest/api/net.html#serverlisten)

```js
app.listen(handle[, backlog][, callback])
app.listen(options[, callback])
app.listen(path[, backlog][, callback])
app.listen([port[, host[, backlog]]][, callback])
```

## Node.js interoperability

Hoa works with web-standard body types (e.g. `string`, `Blob`, `ArrayBuffer`, `TypedArray`, `ReadableStream`). When returning Node.js primitives, you may need to convert them into their web equivalents:

- Buffer → ArrayBuffer (Optional)
- Node.js Readable stream → Web `ReadableStream`

Example: Buffer to ArrayBuffer

```js
app.use(async (ctx) => {
  const buf = Buffer.from('Hello, Hoa!')
  // Convert Buffer to ArrayBuffer
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  ctx.res.body = arrayBuffer
  // ctx.res.body = buf // buf is a Uint8Array instance and also works directly
})
```

Example: Node.js stream to Web ReadableStream

```js
import { Readable } from 'node:stream'

app.use(async (ctx) => {
  const nodeStream = Readable.from(['Hello, ', 'Hoa!'])
  // Convert Node.js Readable stream to Web ReadableStream
  const webStream = Readable.toWeb(nodeStream)
  ctx.res.body = webStream
})
```
