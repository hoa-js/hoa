## @hoajs/router

`@hoajs/router` is a router extension for `Hoa`. It augments a `Hoa` instance with HTTP method helpers, path matching powered by [path-to-regexp](https://github.com/pillarjs/path-to-regexp), and automatic extraction of route parameters into `ctx.req.params`.

```js
import { Hoa } from 'hoa'
import { router } from '@hoajs/router'

const app = new Hoa()
app.extend(router())

app.get('/users/:name', async (ctx, next) => {
  ctx.res.body = `Hello, ${ctx.req.params.name}!`
})

export default app
```

## Adding Routes

Once extended, the `app` instance exposes helpers for all common HTTP verbs:

- `app.get(path, ...handlers)`
- `app.post(path, ...handlers)`
- `app.put(path, ...handlers)`
- `app.patch(path, ...handlers)`
- `app.delete(path, ...handlers)`
- `app.head(path, ...handlers)`
- `app.options(path, ...handlers)`
- `app.all(path, ...handlers)`

Routes accept one or more async handlers. When multiple handlers are supplied they are composed with Hoa's `compose()` utility and executed in order, receiving the usual `(ctx, next)` signature.

## Route Matching

`@hoajs/router` uses `path-to-regexp` internally:

- Path parameters (e.g. `/users/:name`) are decoded and exposed on `ctx.req.params`.
- The original pattern is stored on `ctx.req.routePath`.
- `app.all()` matches every HTTP method.
- `HEAD` requests fall back to `GET` handlers when no explicit `HEAD` handler is defined.

## Router Options

Configure matching behavior by passing options to `router()`:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `sensitive` | `boolean` | `false` | Treat paths as case-sensitive when matching. |
| `end` | `boolean` | `true` | Require the entire URL to match the pattern. |
| `delimiter` | `string` | `'/'` | Segment delimiter used for named parameters. |
| `trailing` | `boolean` | `true` | Allow trailing delimiters (e.g. `/users/`). |

```js
app.extend(router())
// Equivalent to
app.extend(router({
  sensitive: false,
  end: true,
  delimiter: '/',
  trailing: true
}))
```
