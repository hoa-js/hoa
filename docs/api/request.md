## ctx.req.url

Parsed `URL` object of the incoming request.

```bash
curl 'https://example.com/users?id=1'
```

```js
app.use((ctx) => {
  console.log(ctx.req.url)
  /*
  URL {
    href: 'https://example.com/users?id=1',
    origin: 'https://example.com',
    protocol: 'https:',
    username: '',
    password: '',
    host: 'example.com',
    hostname: 'example.com',
    port: '',
    pathname: '/users',
    search: '?id=1',
    searchParams: URLSearchParams { 'id' => '1' },
    hash: ''
  }
   */
})
```

### ctx.req.url=

Overwrite the request URL using a string or `URL` instance.

```js
app.use((ctx) => {
  ctx.req.url = 'https://example.com/users?id=2'
  // or
  ctx.req.url = new URL('https://example.com/users?id=2')
})
```

## ctx.req.href

Full request URL string including protocol, host, path, query, and hash.

```bash
curl 'https://example.com/users?page=1'
```

```js
app.use((ctx) => {
  console.log(ctx.req.href) // -> "https://example.com/users?page=1"
})
```

### ctx.req.href=

Replace the full request URL string.

```bash
curl 'https://example.com/users?page=1'
```

```js
app.use((ctx) => {
  ctx.req.href = 'https://example.com/users?page=2'
})
```

## ctx.req.origin

Origin portion of the URL (scheme + host + port).

```bash
curl 'https://example.com:8080/dashboard'
```

```js
app.use((ctx) => {
  console.log(ctx.req.origin) // -> "https://example.com:8080"
})
```

### ctx.req.origin=

Replace the origin while keeping path, search, and hash components.

```js
app.use((ctx) => {
  ctx.req.origin = 'https://www.example.com'
})
```

## ctx.req.protocol

URL protocol including the trailing colon.

```bash
curl 'http://example.com/'
```

```js
app.use((ctx) => {
  console.log(ctx.req.protocol) // -> "http:"
})
```

### ctx.req.protocol=

Set the request protocol.

```js
app.use((ctx) => {
  ctx.req.protocol = 'https:'
})
```

## ctx.req.host

Host with port (if present).

```bash
curl 'https://example.com:8080/dashboard'
```

```js
app.use((ctx) => {
  console.log(ctx.req.host) // -> "example.com:8080"
})
```

### ctx.req.host=

Set the host string (optionally including port).

```js
app.use((ctx) => {
  ctx.req.host = 'www.example.com'
})
```

## ctx.req.hostname

Hostname without port.

```bash
curl 'https://example.com:8080/dashboard'
```

```js
app.use((ctx) => {
  console.log(ctx.req.hostname) // -> "example.com"
})
```

### ctx.req.hostname=

Set the hostname.

```js
app.use((ctx) => {
  ctx.req.hostname = 'www.example.com'
})
```

## ctx.req.port
Port string, or empty string for the default port.

```bash
curl 'https://example.com:8080/dashboard'
```

```js
app.use((ctx) => {
  console.log(ctx.req.port) // -> "8080"
})
```

### ctx.req.port=

Set the port string.

```js
app.use((ctx) => {
  ctx.req.port = '8080'
})
```

## ctx.req.pathname

URL pathname starting with `/`.

```bash
curl 'https://example.com/dashboard'
```

```js
app.use((ctx) => {
  console.log(ctx.req.pathname) // -> "/dashboard"
})
```

### ctx.req.pathname=

Set the pathname.

```js
app.use((ctx) => {
  ctx.req.pathname = '/dashboard'
})
```

## ctx.req.search

Raw search string including `?`, or empty string when absent.

```bash
curl 'https://example.com/users?page=1'
```

```js
app.use((ctx) => {
  console.log(ctx.req.search) // -> "?page=1"
})
```

### ctx.req.search=

Set the raw search string (leading `?` optional).

```js
app.use((ctx) => {
  ctx.req.search = 'page=42'
})
```

## ctx.req.hash

Hash fragment including `#`.

```js
app.use((ctx) => {
  console.log(ctx.req.hash) // -> ""
})
```

### ctx.req.hash=

Set the hash fragment.

```js
app.use((ctx) => {
  ctx.req.hash = '#hash'
})
```

## ctx.req.method

HTTP method associated with the request.

```bash
curl --request GET 'https://example.com'
```

```js
app.use((ctx) => {
  console.log(ctx.req.method) // -> "GET"
})
```

### ctx.req.method=

Override the request method.

```js
app.use((ctx) => {
  ctx.req.method = 'POST'
})
```

## ctx.req.query

Parsed query object (duplicate keys become arrays).

```bash
curl 'https://example.com/search?q=hoa&page=1&page=2'
```

```js
app.use((ctx) => {
  console.log(ctx.req.query) // -> { q: 'hoa', page: ['1',  '2'] }
})
```

### ctx.req.query=

Replace query parameters with a plain object.

```js
app.use((ctx) => {
  ctx.req.query = { search: 'hoa', page: ['3', '4'] }
})
```

## ctx.req.headers

Plain object snapshot of request headers.

```bash
curl 'https://example.com/' \
  -H 'X-Foo: foo' \
  -H 'X-Bar: bar'
```

```js
app.use((ctx) => {
  console.log(ctx.req.headers) // -> { 'x-foo': 'foo', 'x-bar': 'bar' }
})
```

### ctx.req.headers=

Replace request headers with a `Headers` object, plain object, or array of entries.

```js
app.use((ctx) => {
  ctx.req.headers = {
    'X-Foo': 'foo',
    'X-Bar': 'bar'
  }
  // or
  ctx.req.headers = new Headers([
    ['X-Foo', 'foo'],
    ['X-Bar', 'bar']
  ])
  // or
  ctx.req.headers = [
    ['X-Foo', 'foo'],
    ['X-Bar', 'bar']
  ]
})
```

## ctx.req.body

Underlying `ReadableStream` body.

```js
app.use((ctx) => {
  console.log(ctx.req.body) // -> ReadableStream | null
})
```

### ctx.req.body=

Replace the underlying request body with any value.

```js
app.use((ctx) => {
  ctx.req.body = {
    name: 'Hoa'
  }
  // or
  const encoder = new TextEncoder()
  ctx.req.body = new ReadableStream({
    start (controller) {
      controller.enqueue(encoder.encode('patched body'))
      controller.close()
    }
  })
})
```

## ctx.req.get(field)

Retrieve a request header by name (case-insensitive).

```bash
curl 'https://example.com/' \
  -H 'X-Foo: foo' \
  -H 'Referrer: google.com'
```

```js
app.use((ctx) => {
  console.log(ctx.req.get('x-foo')) // -> "foo"
  console.log(ctx.req.get('referer')) // -> "google.com"
  console.log(ctx.req.get('referrer')) // -> "google.com"
})
```

## ctx.req.getSetCookie()

Return all `Set-Cookie` header values as an array.

```bash
curl 'https://example.com/' \
  -H 'Set-Cookie: session=abc' \
  -H 'Set-Cookie: theme=dark'
```

```js
app.use((ctx) => {
  console.log(ctx.req.getSetCookie()) // -> ["session=abc","theme=dark"]
})
```

## ctx.req.has(field)

Check if a request header is present.

```bash
curl 'https://example.com/' \
  -H 'X-Foo: foo'
```

```js
app.use((ctx) => {
  console.log(ctx.req.has('x-foo')) // -> true
  console.log(ctx.req.has('x-bar')) // -> false
})
```

## ctx.req.set(field, value)

Set a single header value.

```js
app.use((ctx) => {
  ctx.req.set('X-Bar', 'bar')
})
```

### ctx.req.set(headers)

Set multiple headers from a plain object.

```js
app.use((ctx) => {
  ctx.req.set({
    'X-Foo': 'foo',
    'X-Bar': 'bar'
  })
})
```

## ctx.req.append(field, value)

Append a header value without replacing existing ones.

```js
app.use((ctx) => {
  ctx.req.append('X-Foo', 'foo')
  ctx.req.append('X-Bar', 'bar')
})
```

### ctx.req.append(headers)

Append multiple header values from a plain object.

```js
app.use((ctx) => {
  ctx.req.append({
    'X-Foo': 'foo',
    'X-Bar': 'bar'
  })
})
```

## ctx.req.delete(field)

Delete a request header.

```js
app.use((ctx) => {
  ctx.req.delete('cookie')
})
```

## ctx.req.ips

Array of IP addresses from the `X-Forwarded-For` header.

```bash
curl 'https://example.com/' \
  -H 'X-Forwarded-For: 203.0.113.1, 198.51.100.2'
```

```js
app.use((ctx) => {
  console.log(ctx.req.ips) // -> ["203.0.113.1","198.51.100.2"]
})
```

## ctx.req.ip

Best-effort client IP address from standard headers.
Checks headers in the following order:

* `x-client-ip`
* `x-forwarded-for`
* `cf-connecting-ip`
* `do-connecting-ip`
* `fastly-client-ip`
* `true-client-ip`
* `x-real-ip`
* `x-cluster-client-ip`
* `x-forwarded`
* `forwarded-for`
* `forwarded`
* `x-appengine-user-ip`
* `cf-pseudo-ipv4`

```bash
curl 'https://example.com/' \
  -H 'X-Client-IP: 203.0.113.1' \
  -H 'X-Forwarded-For: 203.0.113.2, 198.51.100.2'
```

```js
app.use((ctx) => {
  console.log(ctx.req.ip) // -> "203.0.113.1"
})
```

## ctx.req.length

Content length in bytes, or `null` if unavailable.

```bash
curl --request POST 'https://example.com/' \
  -H 'Content-Type: text/plain; charset=utf-8' \
  --data 'Hello, Hoa!'
```

```js
app.use((ctx) => {
  console.log(ctx.req.length) // -> 11
})
```

## ctx.req.type

Content type without parameters (e.g., `application/json`).

```bash
curl 'https://example.com/' \
  -H 'Content-Type: application/json; charset=utf-8'
```

```js
app.use((ctx) => {
  console.log(ctx.req.type) // -> "application/json"
})
```

## ctx.req.blob()

Read the request body as a `Blob`.

```bash
curl --request POST 'https://example.com/' \
  -H 'Content-Type: text/plain; charset=utf-8' \
  --data 'Hello, Hoa!'
```

```js
app.use(async (ctx) => {
  const blob = await ctx.req.blob()
  console.log(await blob.text()) // -> "Hello, Hoa!"
})
```

> **Note:** Body reader helpers such as `ctx.req.blob()`, `ctx.req.arrayBuffer()`, `ctx.req.text()`, `ctx.req.json()`, and `ctx.req.formData()` can each be invoked only once per request because they consume the underlying stream.

## ctx.req.arrayBuffer()

Read the request body as an `ArrayBuffer`.

```bash
curl --request POST 'https://example.com/' \
  -H 'Content-Type: text/plain; charset=utf-8' \
  --data 'Hello, Hoa!'
```

```js
app.use(async (ctx) => {
  const buffer = await ctx.req.arrayBuffer()
  console.log(new TextDecoder().decode(buffer)) // -> "Hello, Hoa!"
})
```

## ctx.req.text()

Read the request body as text.

```bash
curl --request POST 'https://example.com/' \
  -H 'Content-Type: text/plain; charset=utf-8' \
  --data 'Hello, Hoa!'
```

```js
app.use(async (ctx) => {
  const text = await ctx.req.text()
  console.log(text) // -> "Hello, Hoa!"
})
```

## ctx.req.json()

Read the request body as parsed JSON.

```bash
curl --request POST 'https://example.com/' \
  -H 'Content-Type: application/json; charset=utf-8' \
  --data '{"name": "Hoa"}'
```

```js
app.use(async (ctx) => {
  const body = await ctx.req.json()
  console.log(body) // -> { name: 'Hoa' }
})
```

## ctx.req.formData()

Read the request body as `FormData`.

```bash
curl --request POST 'https://example.com/' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'name=Hoa'
```

```js
app.use(async (ctx) => {
  const form = await ctx.req.formData()
  console.log(form.get('name')) // -> "Hoa"
})
```

## ctx.req.toJSON()

Return JSON representation of the request.

```js
app.use((ctx) => {
  console.log(ctx.req.toJSON()) // -> { method, url, headers }
})
```
