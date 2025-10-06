## @hoajs/logger

Logger middleware for Hoa. It logs the incoming request and the outgoing response with method, path, status, and elapsed time.

## Quick Start

```js
import { Hoa } from 'hoa'
import { logger } from '@hoajs/logger'

const app = new Hoa()
app.use(logger())

app.use(async (ctx) => {
  ctx.res.body = 'Hello, Hoa!'
})

export default app
```

Examples of log lines (without ANSI color):

```
<-- GET /users
--> GET /users 200 12ms
xxx GET /users 500 2s
```

## Color output

By default, color is enabled only when the current stdout is a TTY. You can override this behavior using environment variables:

- `NO_COLOR=1`: disable color output
- `FORCE_COLOR=0`: force disable color output
- `FORCE_COLOR=1` (or any truthy value): force enable color output

Color scheme:
- 2xx: green
- 3xx: cyan
- 4xx: yellow
- 5xx: red

> Note: Colors are applied only to the status code part of the outgoing/error log lines.

## Custom printer

You can pass a custom printer function to control where and how the log line is written. By default, it uses `console.log`.

```ts
type Printer = (str: string, ...rest: string[]) => void
function logger(printer?: Printer): (ctx: import('hoa').HoaContext, next: () => Promise<void>) => Promise<void>
```

Examples:

```js
// Write logs to a file
import fs from 'node:fs'
const stream = fs.createWriteStream('./access.log', { flags: 'a' })
app.use(logger((line) => stream.write(line + '\n')))

// Forward logs to a structured logger
import pino from 'pino'
const log = pino()
app.use(logger((line) => log.info({ msg: line })))
```

## Notes

- The middleware does not modify the response; it only observes and logs.
- When an error is thrown, the status is resolved from `err.status`, `err.statusCode`, or falls back to `500`.
- The path includes query string: e.g. `/users?page=2`.