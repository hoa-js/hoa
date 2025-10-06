## @hoajs/timeout

Provide request timeout for Hoa. If downstream middleware does not finish within the specified duration, respond with 504 Gateway Timeout.

## Quick Start

```js
import { Hoa } from 'hoa'
import { timeout } from '@hoajs/timeout'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const app = new Hoa()
// Timeout after 5 seconds
app.use(timeout(5000))

app.use(async (ctx) => {
  await delay(6000)
  ctx.res.body = 'Hello, Hoa!'
})

export default app
```

## Options

```ts
function timeout(duration: number): (ctx: HoaContext, next: () => Promise<void>) => Promise<void>
```

- duration: Timeout duration in milliseconds. Must be a positive, finite number. If the downstream does not complete within this time, a 504 response is returned.

## Examples

```js
// Minimal positive timeout
app.use(timeout(1))

// Longer timeout
app.use(timeout(5000))

// Combined with other middlewares
app.use(cors())
app.use(compress())
app.use(timeout(2000))

// With @hoajs/router
app.get('/users/:id', timeout(5000), async (ctx) => {
  await delay(6000)
  ctx.res.body = `UserId: ${ctx.req.params.id}`
})
```