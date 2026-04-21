---
name: hoa
description: Build HTTP applications with the Hoa web framework — a minimal, zero-dependency, Web Standards-based framework (inspired by Koa and Hono) that runs on Cloudflare Workers, Deno, Bun, Vercel, AWS Lambda, Lambda@Edge, and Node.js. Use this skill when the user is creating or modifying a Hoa app, writing Hoa middleware/extensions, or wiring a Hoa `fetch` handler into any Web Standards-compatible runtime.
---

# Hoa Framework Skill

Hoa is a minimal Web framework built entirely on the Web Standards Fetch API (`Request` / `Response` / `Headers` / `ReadableStream`). An application is an async middleware pipeline around a single `ctx` object. The app exposes a standard `fetch(request, env, executionCtx)` handler that plugs into any modern JavaScript runtime with no adapter.

## When to use

- Building a web server, HTTP API, edge function, or serverless handler in JavaScript/TypeScript.
- Targeting Cloudflare Workers, Deno, Bun, Vercel Edge, AWS Lambda/Lambda@Edge, Fastly Compute, or Node.js (>= 20) — especially multiple targets from the same source.
- Writing Koa-style middleware with `async (ctx, next) => {}` semantics, but on the Fetch API rather than Node's `http` module.
- Authoring reusable middleware/extensions for the Hoa ecosystem.

Prefer Hoa over Koa when the target runtime is Web Standards-based. Prefer Hoa over Hono when you want Koa-style `ctx.req` / `ctx.res` mutation and a smaller surface. Hoa itself ships **no router** — pair it with a router middleware or use `ctx.req.pathname` + `ctx.req.method` directly.

## Installation

```bash
npm i hoa
```

Requires Node.js >= 20 when running on Node. ESM and CJS builds are both published.

## Core mental model

An app is `new Hoa()`. You register middlewares with `app.use(fn)` and expose `app.fetch` as the runtime entry point. For each request, Hoa creates a `ctx` with:

- `ctx.request` — the original Web Standard `Request` (read-only passthrough).
- `ctx.env` — platform env (e.g. Cloudflare `env`).
- `ctx.executionCtx` — platform execution context (e.g. Cloudflare `ctx`).
- `ctx.state` — per-request, null-prototype object for middleware to share data.
- `ctx.req` — a `HoaRequest` wrapper (URL parts, headers, body readers, IP).
- `ctx.res` — a `HoaResponse` builder (status, headers, body, redirect).
- `ctx.app` — the `Hoa` instance.
- `ctx.throw(status, message?, options?)` / `ctx.assert(value, status, message?)` — throw `HttpError`.

You build the response by mutating `ctx.res` (`ctx.res.status`, `ctx.res.body`, `ctx.res.type`, headers, etc.). After the middleware stack resolves, Hoa synthesizes a Web Standard `Response` from `ctx.res`.

## Quick start

### Minimal app (any Web Standards runtime)

```js
import { Hoa } from 'hoa'

const app = new Hoa()

app.use(async (ctx, next) => {
  ctx.res.body = 'Hello, Hoa!'
})

export default app // { fetch } is available as app.fetch
```

### Cloudflare Workers / Vercel Edge / Deno Deploy

Export the app (or `app.fetch`) as the default export. The runtime will call `app.fetch(request, env, executionCtx)`.

```js
export default app
// or: export default { fetch: app.fetch }
```

### Bun

```js
Bun.serve({ fetch: app.fetch, port: 3000 })
```

### Deno

```ts
Deno.serve(app.fetch)
```

### Node.js (>= 20)

Use a Web Standards server adapter, e.g. `@hono/node-server`, `srvx`, or Node's built-in `node:http` via a Request/Response adapter:

```js
import { serve } from '@hono/node-server'
serve({ fetch: app.fetch, port: 3000 })
```

### AWS Lambda / Lambda@Edge

Wrap `app.fetch` with a Lambda ↔ Fetch adapter (many exist; the Hoa fetch handler is standards-compliant so any adapter that accepts `(request, env, ctx) => Response` works).

## Writing middleware

Middleware is `async (ctx, next) => { ... }`. Call `await next()` to run downstream middleware, then modify the response on the way out. Middlewares execute in registration order, onion-style.

```js
// Logger
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  console.log(`${ctx.req.method} ${ctx.req.pathname} ${ctx.res.status} ${Date.now() - start}ms`)
})

// Response time header
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  ctx.res.set('X-Response-Time', `${Date.now() - start}ms`)
})

// Auth gate
app.use(async (ctx, next) => {
  ctx.assert(ctx.req.get('authorization'), 401, 'Missing token')
  ctx.state.user = await verify(ctx.req.get('authorization'))
  await next()
})

// Route
app.use(async (ctx) => {
  if (ctx.req.pathname === '/hello' && ctx.req.method === 'GET') {
    ctx.res.body = { hello: ctx.state.user.name } // auto JSON
    return
  }
  ctx.throw(404)
})
```

**Rules:**

- Always `await next()`; never call it twice.
- `app.use(fn)` requires a function; it throws `TypeError` otherwise.
- Middlewares are composed lazily and cached; adding a middleware invalidates the cache.
- Throwing (including `ctx.throw`) is caught by the framework and turned into an error response via `ctx.onerror` → `app.onerror`.

## `ctx` (HoaContext) API

Instance properties:

- `ctx.app: Hoa` — the application instance.
- `ctx.req: HoaRequest` — request wrapper (see below).
- `ctx.res: HoaResponse` — response builder (see below).
- `ctx.request?: Request` — original Web Standard `Request`.
- `ctx.env?: any` — platform env (e.g. Cloudflare bindings).
- `ctx.executionCtx?: any` — platform execution context.
- `ctx.state: Record<string, any>` — per-request, null-prototype bag for middleware.

Methods:

- `ctx.throw(status: number, message?: string | HoaError, options?: HoaError): never` — throw an `HttpError`.
- `ctx.assert<T>(value: T, status: number, message?: string | HoaError, options?: HoaError): asserts value is NonNullable<T>` — throws `HttpError` if `value` is falsy.
- `ctx.onerror(err: unknown): Response` — default error → `Response` builder (override via `HoaContext` prototype).
- `ctx.toJSON(): HoaContextJson` — `{ app, req, res }` snapshot.
- `get ctx.response: Response` — synthesize the final Web Standard `Response` from `ctx.res`.

## `ctx.req` (HoaRequest) API

All URL accessors lazy-parse `ctx.request.url` once. Types mirror `types/index.d.ts`.

Instance links: `req.app: Hoa`, `req.ctx: HoaContext`, `req.res: HoaResponse`.

URL (get/set):

- `req.url: URL` — set with `string | URL`.
- `req.href: string` — full URL (origin + path + search + hash).
- `req.origin: string` — scheme + host + port.
- `req.protocol: string` — e.g. `'https:'`.
- `req.host: string` — host with port.
- `req.hostname: string` — host without port (IPv6 brackets stripped).
- `req.port: string` — port as string, `''` for default.
- `req.pathname: string` — starts with `/`.
- `req.search: string` — includes leading `?`, or `''`.
- `req.hash: string` — includes leading `#`, or `''`.
- `req.method: string` — override-safe (setter stores locally).
- `req.query: Record<string, string | string[]>` — duplicate keys become arrays; setter replaces `search`.

Headers (Web Standards `Headers` under the hood):

- `req.headers: Record<string, string>` — plain-object snapshot (get) / replace (set) with `Headers | Record<string, string> | Iterable<[string, string]>`.
- `req.get(field: string): string | null` — case-insensitive; `'referer'` / `'referrer'` are aliased.
- `req.has(field: string): boolean`
- `req.set(field: string, val: string): void` / `req.set(headers: Record<string, string>): void`
- `req.append(field: string, val: string): void` / `req.append(headers: Record<string, string>): void`
- `req.delete(field: string): void`
- `req.getSetCookie(): string[]` — all `Set-Cookie` values (use this to preserve multi-cookie semantics).

Client IP:

- `req.ip: string` — first match across `x-client-ip`, `x-forwarded-for`, `cf-connecting-ip`, `do-connecting-ip`, `fastly-client-ip`, `true-client-ip`, `x-real-ip`, `x-cluster-client-ip`, `x-forwarded`, `forwarded-for`, `forwarded`, `x-appengine-user-ip`, `cf-pseudo-ipv4`. Returns `''` if none.
- `req.ips: string[]` — comma-split `x-forwarded-for` (trimmed, empty values dropped); falls back to `[req.ip]` when that header is absent, or `[]` if no client IP can be resolved.

Body (each underlying stream can only be consumed once):

- `req.body: ReadableStream<Uint8Array> | null` — raw stream (setter accepts `any`).
- `req.length: number | null` — parsed `Content-Length`.
- `req.type: string | null` — media type without parameters (e.g. `'application/json'`).
- `req.text(): Promise<string>`
- `req.json<T = any>(): Promise<T>`
- `req.blob(): Promise<Blob>`
- `req.arrayBuffer(): Promise<ArrayBuffer>`
- `req.formData(): Promise<FormData>`

Misc:

- `req.toJSON(): HoaRequestJson` — `{ method, url, headers }`.

## `ctx.res` (HoaResponse) API

Instance links: `res.app: Hoa`, `res.ctx: HoaContext`, `res.req: HoaRequest`.

Status:

- `res.status: number` — defaults to `404`. Setting a `statusEmptyMapping` code (204/205/304) clears body; non-integer values or codes outside `100–1000` throw `TypeError`.
- `res.statusText: string` — auto-synced with `status` unless you set it explicitly.

Body (polymorphic setter `HoaResponseBody = string | Blob | ArrayBuffer | ArrayBufferView | ReadableStream | FormData | URLSearchParams | Response | Record<string, any> | null | undefined`):

- `res.body: HoaResponseBody` — auto `Content-Type` detection:
  - `string` starting with `<` → `text/html`, else `text/plain`.
  - `Blob` → uses `blob.type` or falls back to `application/octet-stream`.
  - `ArrayBuffer` / TypedArray / `ReadableStream` → `application/octet-stream`.
  - `FormData` → left untyped (runtime adds multipart boundary).
  - `URLSearchParams` → `application/x-www-form-urlencoded`.
  - `Response` → body, status, and headers copied through.
  - Any other object → JSON-serialized with `application/json`.
  - `null` / `undefined` → when status is not already 204/205/304, if `Content-Type` is `application/json` the body becomes the literal string `'null'` (headers/status untouched); otherwise status becomes `204` and `Content-Type` / `Content-Length` / `Transfer-Encoding` are removed. Setting `null` (but not `undefined`) also marks the body as explicitly null so the final response serializes `Content-Length: 0`.
  - Setting a non-null body auto-sets `status` to `200` if not already explicit.

Content-Type / length:

- `res.type: string | null` — get (parameters stripped) / set (accepts aliases: `html`, `text`, `json`, `xml`, `md`, `form`, `pdf`, `zip`, `wasm`, `webmanifest`, `js`, `ts`, `png`, `jpg`, `jpeg`, `gif`, `svg`, `webp`, `avif`, `ico`, `mp3`, `wav`, `ogg`, `mp4`, `webm`, `avi`, `mov`, `woff`, `woff2`, `ttf`, `otf`, `bin`).
- `res.length: number | null` — reads/sets `Content-Length`; computes from body when possible (setter ignored if `Transfer-Encoding` present).

Headers (same semantics as `req.*`):

- `res.headers: Record<string, string>` — snapshot (get) / replace (set).
- `res.get(field: string): string | null`
- `res.has(field: string): boolean`
- `res.set(field: string, val: string): void` / `res.set(headers: Record<string, string>): void`
- `res.append(field: string, val: string): void` / `res.append(headers: Record<string, string>): void`
- `res.delete(field: string): void`
- `res.getSetCookie(): string[]`

Redirects:

- `res.redirect(url: string): void` — absolute `http(s)://` URLs normalized via `new URL(url)`, `Location` percent-safe-encoded, status becomes `302` unless already a redirect code (300/301/302/303/305/307/308), `Content-Type` forced to `text/plain`, body set to `"Redirecting to <url>."`.
- `res.back(alt?: string): void` — same-origin `Referrer` if safe, else `alt` or `/`.

Misc:

- `res.toJSON(): HoaResponseJson` — `{ status, statusText, headers }`.
- `HEAD` requests always return an empty body; `Content-Length` computed when missing.

## Error handling

- Throw an `HttpError` via `ctx.throw(status, message?, options?)` or `ctx.assert(cond, status, message?)`.
- `HttpError` (`import { HttpError } from 'hoa'`) fields: `status` / `statusCode`, `expose` (defaults to `status < 500`), `headers` (normalized via `Headers`), standard `message` / `cause`. Non-integer status throws `TypeError`; statuses outside `400–599` are coerced to `500`. Default `message` falls back to `statusTextMapping[status]`.
- On a thrown error Hoa:
  1. Calls `app.onerror(err, ctx)` (logs to `console.error` unless `err.status === 404`, `err.expose`, or `app.silent === true`).
  2. Resets response headers, applies `err.headers` if provided, forces `Content-Type: text/plain`.
  3. Sets status to `err.status || err.statusCode`, or `500` if invalid.
  4. Sets body to `err.expose ? err.message : statusTextMapping[status]`.
- Override error behavior by subclassing or assigning: `app.onerror = (err, ctx) => { ... }`, or `app.silent = true` to suppress logging.

## Extensions

| | `app.use(fn)` | `app.extend(fn)` |
|---|---|---|
| **When it runs** | Per request | Once at startup |
| **Receives** | `(ctx, next)` | `(app)` |
| **Purpose** | Handle requests/responses | Extend app, patch prototypes, install middleware bundles |
| **Async** | Native | Synchronous only |

Use `app.extend` to add properties/methods to `app`, subclass `HoaContext`/`HoaRequest`/`HoaResponse`, or batch-install middlewares. Runs `fn(app)` immediately and returns `app` for chaining.

```js
// Extend: add a helper method to the context prototype
app.extend((app) => {
  app.HoaContext.prototype.json = function (data, status = 200) {
    this.res.status = status
    this.res.body = data
  }
})

// Use: leverage the helper in request middleware
app.use(async (ctx) => {
  ctx.json({ hello: 'world' })
})
```

You can also swap request/response classes wholesale before handling requests:

```js
class MyContext extends HoaContext { ... }
app.HoaContext = MyContext
```

## Named exports

```js
import {
  Hoa,            // default export, also named
  HoaContext,
  HoaRequest,
  HoaResponse,
  HttpError,
  compose,        // compose(middlewares[]) → single middleware
  statusTextMapping,
  statusRedirectMapping,
  statusEmptyMapping,
} from 'hoa'
```

`compose` validates input is an array, flattens nested arrays, requires every entry to be a function, and returns a single `(ctx, next)` dispatcher — use it to bundle middleware groups.

## Ecosystem (official `@hoajs/*` middleware)

Prefer these over ad-hoc implementations or Koa/Hono packages. Install as `npm i @hoajs/<name>`.

- **Adapter**: `@hoajs/adapter` (runtime/server adapters for Node, Lambda, etc.).
- **Routing**: `@hoajs/router`, `@hoajs/tiny-router`.
- **Body / parsing**: `@hoajs/bodyparser` (JSON / urlencoded / text), `@hoajs/formidable` (multipart), `@hoajs/json` (JSON formatting).
- **Auth**: `@hoajs/basic-auth`, `@hoajs/jwt`, `@hoajs/csrf`.
- **Security headers**: `@hoajs/secure-headers` (CSP, COEP/COOP/CORP, HSTS, Referrer-Policy, X-Frame-Options, Permission-Policy, …), `@hoajs/cors`, `@hoajs/ip` (IP allow/deny).
- **Validation**: `@hoajs/zod`, `@hoajs/valibot`, `@hoajs/nana`.
- **Caching / perf**: `@hoajs/cache`, `@hoajs/compress`, `@hoajs/etag`, `@hoajs/timeout`.
- **Rate limit**: `@hoajs/cloudflare-rate-limit`.
- **Cookies / headers / negotiation**: `@hoajs/cookie`, `@hoajs/vary`, `@hoajs/language`, `@hoajs/method-override`, `@hoajs/powered-by`.
- **Observability**: `@hoajs/logger`, `@hoajs/request-id`, `@hoajs/response-time`, `@hoajs/sentry`.
- **Views**: `@hoajs/mustache`.
- **Misc**: `@hoajs/favicon`, `@hoajs/combine` (compose sub-apps), `@hoajs/context-storage` (per-request async context).

Full docs: https://hoa-js.com/what-is-hoa.html

## Conventions and gotchas

- **No built-in router.** Branch on `ctx.req.method` + `ctx.req.pathname`, or install a router middleware (any `(ctx, next) => {}` function works).
- **Don't return a value from middleware expecting it to become the body.** Always assign `ctx.res.body = ...`. Returning a `Response` does nothing unless you set it as `ctx.res.body`.
- **Body can be read only once.** Choose one of `req.text()` / `req.json()` / `req.blob()` / `req.arrayBuffer()` / `req.formData()` per request.
- **`ctx.res.status` defaults to 404.** Setting a non-null body promotes it to `200` automatically.
- **`ctx.res.body = null`** (vs `undefined`) is remembered as explicit-null so the final response emits `Content-Length: 0`. If `Content-Type` is already JSON, the body becomes the literal string `'null'`; otherwise status becomes `204` and content headers are stripped.
- **HEAD responses** always have an empty body; the framework fills `Content-Length` when it can.
- **`compose(middlewares)`** requires an array; it flattens one level and every entry must be a function.
- **Errors must be real `Error` instances** (including cross-realm). Throwing non-errors is coerced to `Error("non-error thrown: …")`.

## Recipes

### JSON API with validation

```js
app.use(async (ctx) => {
  if (ctx.req.method !== 'POST') ctx.throw(405)
  const input = await ctx.req.json().catch(() => ctx.throw(400, 'Invalid JSON'))
  ctx.assert(input?.email, 422, 'email required', { expose: true })
  ctx.res.status = 201
  ctx.res.body = { id: crypto.randomUUID(), ...input } // JSON auto
})
```

### Streaming response

```js
app.use(async (ctx) => {
  const stream = new ReadableStream({
    async start (controller) {
      controller.enqueue(new TextEncoder().encode('hello\n'))
      controller.close()
    }
  })
  ctx.res.type = 'text'
  ctx.res.body = stream
})
```

### Proxy pass-through

```js
app.use(async (ctx) => {
  const upstream = await fetch(`https://api.example.com${ctx.req.pathname}${ctx.req.search}`, {
    method: ctx.req.method,
    headers: ctx.req.headers,
    body: ['GET', 'HEAD'].includes(ctx.req.method) ? undefined : ctx.req.body,
  })
  ctx.res.body = upstream // status + headers copied through
})
```

### Redirect

```js
app.use(async (ctx) => {
  if (ctx.req.pathname === '/old') return ctx.res.redirect('/new')
})
```

## References

- Source entry: `src/hoa.js`
- Context / Request / Response: `src/context.js`, `src/request.js`, `src/response.js`
- Middleware composition: `src/lib/compose.js`
- HttpError: `src/lib/http-error.js`
- Status / MIME / URL helpers: `src/lib/utils.js`
- Official site & docs: https://hoa-js.com
- LLM-oriented docs: https://hoa-js.com/llms-full.txt (full) · https://hoa-js.com/llms.txt (index)
- Repository: https://github.com/hoa-js/hoa
