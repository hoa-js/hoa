## ctx.res.headers

Plain object snapshot of response headers (header names normalized to lowercase).

```js
app.use((ctx) => {
  console.log(ctx.res.headers) // -> { 'content-type': 'application/json' }
})
```

### ctx.res.headers=

Replace response headers with a `Headers` instance, plain object, or array of entries.

```js
app.use((ctx) => {
  ctx.res.headers = {
    'content-type': 'application/json',
    'cache-control': 'no-cache'
  }
  // or
  ctx.res.headers = new Headers({
    'content-type': 'application/json',
    'cache-control': 'no-cache'
  })
  // or
  ctx.res.headers = [
    ['content-type', 'application/json',
    ['cache-control', 'no-cache']
  ]
})
```

## ctx.res.get(field)

Retrieve a response header by name (case-insensitive).

```js
app.use((ctx) => {
  console.log(ctx.res.get('content-type')) // -> "application/json"
})
```

## ctx.res.getSetCookie()

Return all `Set-Cookie` headers as an array.

```js
app.use((ctx) => {
  console.log(ctx.res.getSetCookie()) // -> ["session=abc", "theme=dark"]
})
```

## ctx.res.has(field)

Check for the existence of a response header.

```js
app.use((ctx) => {
  console.log(ctx.res.has('content-type')) // -> false
})
```

## ctx.res.set(field, value)

Set a single response header value.

```js
app.use((ctx) => {
  ctx.res.set('X-Foo', 'foo')
})
```

### ctx.res.set(headers)

Set multiple headers from a plain object.

```js
app.use((ctx) => {
  ctx.res.set({
    'X-Foo': 'foo',
    'X-Bar': 'bar'
  })
})
```

## ctx.res.append(field, value)

Append a header value without removing existing ones.

```js
app.use((ctx) => {
  ctx.res.append('Set-Cookie', 'one=1; Path=/')
  ctx.res.append('Set-Cookie', 'two=2; Path=/')
})
```

### ctx.res.append(headers)

Append multiple headers using a plain object.

```js
app.use((ctx) => {
  ctx.res.append({
    'X-Foo': 'foo',
    'X-Bar': 'bar'
  })
})
```

## ctx.res.delete(field)

Delete a response header.

```js
app.use((ctx) => {
  ctx.res.delete('content-length')
})
```

## ctx.res.status

Current response status code (defaults to `404`). When a body is set, it automatically becomes `200` if not explicitly set.

```js
app.use((ctx) => {
  console.log(ctx.res.status) // -> 404 (no body set yet)
  ctx.res.body = 'Hello'
  console.log(ctx.res.status) // -> 200 (automatically set when body is assigned)
})
```

### ctx.res.status=

Set the response status code.

```js
app.use((ctx) => {
  ctx.res.status = 201
  ctx.res.body = 'Created'
})
```

## ctx.res.statusText

Current response status text. Defaults to the standard message for the current status.

```js
app.use((ctx) => {
  console.log(ctx.res.statusText) // "OK"
})
```

### ctx.res.statusText=

Override the response status text.

```js
app.use((ctx) => {
  ctx.res.status = 202
  ctx.res.statusText = 'Accepted for processing'
})
```

## ctx.res.body

Get the current response body.

```js
app.use(async (ctx, next) => {
  console.log(ctx.res.body) // -> any
})
```

### ctx.res.body=

Set the response body. Supports `string`, `object`, `Blob`, `ArrayBuffer`, `TypedArray`, `ReadableStream`, `FormData`, `URLSearchParams`, or `Response`. Setting `null` or `undefined` clears the body and adjusts headers for empty responses.

```js
app.use((ctx) => {
  // string
  ctx.res.body = 'Hello, Hoa!'
  // json
  ctx.res.body = { message: 'Hello, Hoa!' }
  // Blob
  ctx.res.body = new Blob(['Hello, Hoa!'])
  // ArrayBuffer
  ctx.res.body = new TextEncoder().encode('Hello, Hoa!').buffer
  // TypedArray
  ctx.res.body = new TextEncoder().encode('Hello, Hoa!') 
  // ReadableStream
  ctx.res.body = new ReadableStream({
    start (controller) {
      controller.enqueue(new TextEncoder().encode('Hello, Hoa!'))
      controller.close()
    }
  })
  // FormData
  const form = new FormData()
  form.append('message', 'Hello, Hoa!')
  ctx.res.body = form
  // URLSearchParams
  ctx.res.body = new URLSearchParams({ message: 'Hello, Hoa!' })
  // Response
  ctx.res.body = new Response('Hello, Hoa!')
  // null
  ctx.res.body = null
  // undefined
  ctx.res.body = undefined
})
```

## ctx.res.redirect(url)

Perform an HTTP redirect (defaults to status `302` unless already a redirect status).

```js
app.use((ctx) => {
  ctx.res.redirect('https://example.com/login')
})
```

## ctx.res.back([alt])

Redirect to the `Referrer` header when safe; fallback to `alt` or `/`.

```js
app.use((ctx) => {
  ctx.res.back()
  ctx.res.back('/home')
})
```

## ctx.res.type

Content-Type without parameters.

```js
app.use((ctx) => {
  console.log(ctx.res.type) // -> "application/json"
})
```

### ctx.res.type=

Set the response type and update the `Content-Type` header.

```js
app.use((ctx) => {
  ctx.res.type = 'json' // Optional
  ctx.res.body = { ok: true }
})
```

## ctx.res.length

Content-Length in bytes. Automatically computed from the body when possible.

```js
app.use((ctx) => {
  ctx.res.body = 'Hello, Hoa!'
  console.log(ctx.res.length) // -> 11
})
```

### ctx.res.length=

Manually set the response Content-Length header.

```js
app.use((ctx) => {
  ctx.res.body = 'Hello'
  ctx.res.length = new TextEncoder().encode(ctx.res.body).length
})
```

## ctx.res.toJSON()

Return JSON representation of the response.

```js
app.use((ctx) => {
 console.log(ctx.res.toJSON()) // -> { status: 200, statusText: 'OK', headers: {...} }
})
