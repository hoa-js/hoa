## ctx.throw(status, [message], [options])

Throw an HttpError.

```js
ctx.throw(400)
ctx.throw(400, 'Bad Request')
ctx.throw(400, 'Bad Request', {
  expose: true,
  cause: new Error('Another Error'),
  headers: { 'X-Foo': 'foo' }
})
ctx.throw(400, {
  message: 'Bad Request',
  expose: true,
  cause: new Error('Another Error'),
  headers: { 'X-Foo': 'foo' }
})
```

## ctx.assert(value, status, [message], [options])

Assert condition or throw an HttpError.

```js
ctx.assert(false, 400)
ctx.assert(false, 400, 'Bad Request')
ctx.assert(false, 400, 'Bad Request', {
  expose: true,
  cause: new Error('Another Error'),
  headers: { 'X-Foo': 'foo' }
})
ctx.assert(false, 400, {
  message: 'Bad Request',
  expose: true,
  cause: new Error('Another Error'),
  headers: { 'X-Foo': 'foo' }
})
```

## ctx.toJSON()

Return JSON representation of the context.

```js
ctx.toJSON() // { app, req, res }
```
