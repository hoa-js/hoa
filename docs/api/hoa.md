## app

```js
const app = new Hoa({
  name: 'MyApp'
})
```

## app.extend(fn)

Extend the application with a plugin initializer.

```js
function hoaView (options) {
  //...
  return function hoaViewExtension (app) {
    app.HoaResponse.prototype.render = function render (templateName, data) {
      this.type = 'html'
      this.body = `<p>Hello, ${data}!</p>`
    }
  }
}

app.extend(hoaView())

app.use((ctx) => {
  ctx.res.render('template.html', 'Hoa') // <p>Hello, Hoa!</p>
})
```

## app.use(fn)

Register a middleware. Executed in registration order.

```js
const calls = [] // [1, 3, 4, 2]

app.use(async (ctx, next) => {
  calls.push(1)
  await next()
  calls.push(2)
})

app.use(async (ctx, next) => {
  calls.push(3)
  await next()
  calls.push(4)
})

```

## app.fetch(request, env, executionCtx)

Web Standards fetch handler - main entry point for HTTP requests. Compatible with Cloudflare Workers, Deno, and other Web Standards environments.

```js
export default app

// or

export default {
  fetch: app.fetch,
  scheduled: async (event, env, ctx) => {} // eg: Cloudflare Worker
}
```

## app.onerror(err, ctx)

Default error handler for unhandled application errors. Logs errors to console unless they're client errors (4xx) or explicitly exposed.

```js
app.onerror = (err, ctx) => {
  console.error(err) // HttpError: Boom
} 

app.use((ctx) => {
  ctx.throw(500, 'Boom')
})
```

## app.toJSON()

Return JSON representation of the app.

```js
app.toJSON() // { name: 'Hoa' }
```
