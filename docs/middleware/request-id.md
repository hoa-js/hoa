## @hoajs/request-id

Generate and propagate a traceable Request ID for each request and response to help with log correlation, debugging, and cross-service tracing.

## Quick Start

```js
import { Hoa } from 'hoa'
import { requestId } from '@hoajs/request-id'

const app = new Hoa()
app.use(requestId())

app.use(async (ctx) => {
  ctx.res.body = `Hello, ${ctx.state.requestId}!`
})

export default app
```

## Options

```ts
interface RequestIdOptions {
  // Maximum length (default: 255)
  limitLength?: number
  // Response header name (default: 'X-Request-Id'); set '' to disable header read/write
  headerName?: string
  // Custom ID generator (default: crypto.randomUUID); ctx will be passed to the function
  generator?: (ctx: import('hoa').HoaContext) => string
}
```

- limitLength: Limits the maximum length of the request ID; if exceeded, a new ID will be generated.
- headerName: The header name used to read/write the ID; pass an empty string '' to disable reading from the request header and writing the response header.
- generator: Custom ID generation logic; receives ctx; defaults to `crypto.randomUUID()`.

## Examples

- Custom response header name:
```js
app.use(requestId({ headerName: 'X-Correlation-Id' }))
```

- Disable reading request header and writing response header:
```js
app.use(requestId({ headerName: '' }))
```

- Custom ID generator:
```js
app.use(requestId({
  generator: (ctx) => `${ctx.app.name}-${Date.now()}`
}))
```
