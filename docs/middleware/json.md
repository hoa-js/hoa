## @hoajs/json

Format route responses into a consistent JSON envelope for success and error cases in Hoa.

- Builds a success body using the success schema.
- Catches errors, optionally merges error headers, and builds a failure body using the fail schema.
- Skips building a body for HEAD and OPTIONS requests.

## Quick Start

```js
import { Hoa } from 'hoa'
import { json } from 'hoa-json'

const app = new Hoa()
app.use(json())

app.use(async (ctx, next) => {
  if (ctx.req.pathname === '/') {
    ctx.res.body = 'Hello, Hoa!'
  }
  if (ctx.req.pathname === '/error') {
    ctx.throw(400, 'Bad request')
  }
})
```

- Request to `/`:
  - Response status: 200
  - Response JSON body: `{ code: 200, data: "Hello, Hoa!" }`
- Request to `/error`:
  - Response status: 400
  - Response JSON body: `{ code: 400, message: "Bad request" }`

## Options

- status: `number | ((ctx: HoaContext, error?: Error) => number | Promise<number>)`
  - Status schema or a fixed status code. If a function, it is called as `(ctx, error?)` and may be async.
  - Default: for success, uses `ctx.res.status`; for failure, uses `error.status || error.statusCode || 500`.

- success: `Record<string, ((ctx: HoaContext) => any | Promise<any>) | any>`
  - Keys and resolvers used to compose the success JSON body; values may be literals or async functions.
  - Default: `{ code: ctx.res.status, data: ctx.res.body || null }`.

- fail: `Record<string, ((ctx: HoaContext, error: Error) => any | Promise<any>) | any>`
  - Keys and resolvers used to compose the error JSON body; values may be literals or async functions.
  - Default: `{ code: error.status || error.statusCode || 500, message: error.message || null }`.

## Examples

### Force success status to 200

```js
app.use(json({ status: 200 }))

// Route sets custom status; wrapper still responds with 200
app.use(async (ctx, next) => {
  if (ctx.req.pathname === '/') {
    ctx.res.status = 201
    ctx.res.body = 'Hello, Hoa!'
    return
  }
  await next()
})
```

Response status: 200, body:

```json
{ "code": 201, "data": "Hello, Hoa!" }
```

### Custom success schema

```js
app.use(json({
  success: {
    code: () => 204,
    data: () => 'No content'
  }
}))
```

Response status: 200, body:

```json
{ "code": 204, "data": "No content" }
```

### Custom fail schema

```js
app.use(json({
  fail: {
    code: () => 410,
    data: () => 'Gone'
  }
}))

app.use(async (ctx, next) => {
  if (ctx.req.pathname === '/error') {
    ctx.throw(400, 'Bad request')
  }
  await next()
})
```

Response status: 400, body:

```json
{ "code": 410, "data": "Gone" }
```

### Error headers merge

If the thrown error contains a `headers` property, those headers are merged into the response.

```js
app.use(async (ctx) => {
  if (ctx.req.pathname === '/error-headers') {
    ctx.throw(418, { message: "I'm a teapot", headers: { 'x-error-id': 'abc123' } })
  }
})
```

Response:

- status: 418
- headers: `{ "x-error-id": "abc123" }`
- body: `{ "code": 418, "message": "I'm a teapot" }`

The middleware automatically merges any error.headers into ctx.res.headers, allowing custom error metadata to propagate to the client.

### HEAD/OPTIONS example

The JSON middleware skips building a body for HEAD and OPTIONS requests.

```js
app.use(async (ctx) => {
  if (ctx.req.method === 'HEAD' && ctx.req.pathname === '/head') {
    ctx.res.status = 204
    return
  }
  if (ctx.req.method === 'OPTIONS' && ctx.req.pathname === '/options') {
    ctx.res.set('Allow', 'GET,HEAD,OPTIONS')
    ctx.res.status = 204
    return
  }
})

// HEAD request
const headRes = await app.fetch(new Request('http://localhost/head', { method: 'HEAD' }))
// HTTP status: 204
// Response body: '' (empty) — JSON body is not constructed for HEAD

// OPTIONS request
const optionsRes = await app.fetch(new Request('http://localhost/options', { method: 'OPTIONS' }))
// HTTP status: 204
// Headers: { 'Allow': 'GET,HEAD,OPTIONS' }
// Response body: '' (empty) — JSON body is not constructed for OPTIONS
```