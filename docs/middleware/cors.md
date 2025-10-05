## @hoajs/cors

`@hoajs/cors` is a CORS (Cross-Origin Resource Sharing) middleware for Hoa. It adds the appropriate CORS response headers for both simple requests and preflight (OPTIONS) requests.

## Quick Start

```js
import { Hoa } from 'hoa'
import { cors } from '@hoajs/cors'

const app = new Hoa()

// Enable CORS for all routes with defaults
app.use(cors())

app.use(async (ctx) => {
  ctx.res.body = 'Hello, Hoa!'
})

export default app
```

Route-scoped CORS (with `@hoajs/router`):

```js
import { Hoa } from 'hoa'
import { router } from '@hoajs/router'
import { cors } from '@hoajs/cors'

const app = new Hoa()
app.extend(router())

app.get('/public', cors(), async (ctx) => {
  ctx.res.body = 'Public resource'
})

app.get('/private', cors({
  origin: ['https://example.com', 'https://app.example.com'],
  credentials: true
}), async (ctx) => {
  ctx.res.body = 'Private resource'
})

export default app
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `origin` | `string \| string[] \| (origin, ctx) => string \| null \| Promise<string \| null>` | `'*'` | Allowed origin(s). Function can return the allowed origin or `null` to disallow. |
| `allowMethods` | `string[] \| (origin, ctx) => string[] \| Promise<string[]>` | `['GET','HEAD','PUT','POST','DELETE','PATCH']` | Methods allowed for preflight requests (sent via `Access-Control-Allow-Methods`). |
| `allowHeaders` | `string[]` | `[]` | Headers allowed in preflight. If empty, it echoes the request's `Access-Control-Request-Headers`. |
| `maxAge` | `number` | `undefined` | Seconds the preflight response can be cached (`Access-Control-Max-Age`). |
| `credentials` | `boolean` | `false` | Whether to allow credentials (`Access-Control-Allow-Credentials: true`). |
| `exposeHeaders` | `string[]` | `[]` | Response headers exposed to the browser (`Access-Control-Expose-Headers`). |

## Behavior Details

- Access-Control-Allow-Origin
  - If `origin` is `'*'`, the middleware sets `Access-Control-Allow-Origin: *`.
  - If `credentials: true` and the computed allow origin is `'*'`, the middleware falls back to the exact request origin (if present) to comply with the CORS spec.
  - For specific origins (string, array, function), when an origin is allowed and not `'*'`, it appends `Vary: Origin`.

- Access-Control-Allow-Credentials
  - Only set to `true` when returning a specific origin (not `'*'`).

- Access-Control-Expose-Headers
  - When `exposeHeaders` is provided, it sets `Access-Control-Expose-Headers` as a comma-separated list.

- Preflight (OPTIONS) Requests
  - If `maxAge` is defined, sets `Access-Control-Max-Age`.
  - Resolves `allowMethods` (array or function) and sets `Access-Control-Allow-Methods` as a comma-separated list.
  - Determines `allowHeaders`:
    - If `allowHeaders` option is provided, it uses that list.
    - Otherwise, it echoes the request's `Access-Control-Request-Headers` (if present) and appends `Vary: Access-Control-Request-Headers`.
  - Ensures a proper 204 preflight response by removing entity headers (`Content-Length`, `Content-Type`) and sending an empty body.

- Vary Header Merging
  - When setting `Vary: Origin` or `Vary: Access-Control-Request-Headers`, existing `Vary` values are preserved and new entries are appended (e.g., `accept-encoding, Origin`).

- Normalization & Deduplication
  - The middleware trims and deduplicates header lists (`allowHeaders`, `exposeHeaders`) and methods for consistency before emitting headers.

## Examples

Allow a single origin:

```js
app.use(cors({ origin: 'https://example.com' }))
```

Allow multiple origins:

```js
app.use(cors({ origin: ['https://a.example.com', 'https://b.example.com'] }))
```

Dynamic origin (sync):

```js
app.use(cors({
  origin: (origin, ctx) => origin === 'https://allowed.example.com' ? origin : null
}))
```

Dynamic origin (async):

```js
app.use(cors({
  origin: async (origin, ctx) => {
    const allowed = await isAllowed(origin)
    return allowed ? origin : null
  }
}))
```

Custom preflight methods:

```js
app.use(cors({ allowMethods: ['GET', 'POST'] }))
```

Dynamic preflight methods:

```js
app.use(cors({
  allowMethods: async (origin, ctx) => {
    // Decide based on origin or ctx
    return ['GET', 'POST', 'PUT']
  }
}))
```

Expose custom headers to the browser:

```js
app.use(cors({ exposeHeaders: ['x-request-id', 'x-trace'] }))
```

Echo request headers on preflight (default):

```js
app.use(cors())
// If the request includes Access-Control-Request-Headers,
// the middleware echoes them via Access-Control-Allow-Headers
```
