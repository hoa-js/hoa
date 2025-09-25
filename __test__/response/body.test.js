import Hoa from '../../src/application.js'

describe('res.body', () => {
  it('should not override existing Content-Type', async () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.type = 'text/plain; charset=iso-8859-1'
    ctx.res.body = 'Hello, Hoa!'
    expect(ctx.res.get('content-type')).toBe('text/plain; charset=iso-8859-1')
    expect(ctx.res.body).toBe('Hello, Hoa!')
  })

  it('should infer Content-Type for JSON objects', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.body = { hello: 'Hoa' }
    expect(ctx.res.get('content-type')).toBe('application/json')
    expect(ctx.res.type).toBe('application/json')
  })

  it('should default Content-Type to text/plain for strings', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 200
    ctx.res.body = 'Hello, Hoa!'
    expect(ctx.res.get('content-type')).toBe('text/plain;charset=UTF-8')
    expect(ctx.res.body).toBe('Hello, Hoa!')
  })

  it('should not override explicit Content-Length', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Length', '1024')
    ctx.res.body = 'Hello, Hoa!'
    expect(ctx.res.get('content-length')).toBe('1024')
    expect(ctx.res.body).toBe('Hello, Hoa!')
  })

  it('should remove Content-Length for undefined body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Length', '1024')
    ctx.res.status = 200
    ctx.res.body = undefined
    expect(ctx.res.get('content-length')).toBeNull()
    expect(ctx.res.length).toBeNull()
    expect(ctx.res.status).toBe(204)
    expect(ctx.res.body).toBeUndefined()
  })

  it('should not override explicitly set Content-Type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('content-type', 'text/html')
    ctx.res.body = 'Hello, Hoa!'
    expect(ctx.res.get('content-type')).toBe('text/html')
    expect(ctx.res.type).toBe('text/html')
    expect(ctx.res.body).toBe('Hello, Hoa!')
  })

  it('should set Content-Type as html for HTML strings', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.body = '<h1>Hello, Hoa!</h1>'
    expect(ctx.res.get('content-type')).toBe('text/html;charset=UTF-8')
    expect(ctx.res.type).toBe('text/html')
    expect(ctx.res.body).toBe('<h1>Hello, Hoa!</h1>')
  })

  it('should preserve JSON Content-Type for objects', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'application/json; charset=utf-8')
    ctx.res.body = { a: 1 }
    expect(ctx.res.get('content-type')).toBe('application/json; charset=utf-8')
    expect(ctx.res.type).toBe('application/json')
    expect(ctx.res.body).toEqual({ a: 1 })
  })

  it('should set Content-Type for Uint8Array', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const bytes = Uint8Array.from([1, 2, 3])
    ctx.res.body = bytes
    expect(ctx.res.get('content-type')).toBe('application/octet-stream')
    expect(ctx.res.type).toBe('application/octet-stream')
  })

  it('should set text/plain when type is null and body is string', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.type = null
    ctx.res.status = 200
    ctx.res.body = 'Tobi'
    expect(ctx.res.get('content-type')).toBe('text/plain;charset=UTF-8')
    expect(ctx.res.type).toBe('text/plain')
  })

  it('should set text/plain when type is null and body is empty string', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.type = null
    ctx.res.status = 200
    ctx.res.body = ''
    expect(ctx.res.get('content-type')).toBe('text/plain;charset=UTF-8')
    expect(ctx.res.type).toBe('text/plain')
  })

  it('should not override explicit content-length', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('content-length', '8')
    ctx.res.body = 'dubstep'
    expect(ctx.res.get('content-length')).toBe('8')
    expect(ctx.res.length).toBe(8)
  })

  it('should remove content-type for null body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.body = null
    expect(ctx.res.get('content-type')).toBeNull()
    expect(ctx.res.type).toBeNull()
    expect(ctx.res.length).toBeNull()
  })

  it('should set body to literal "null" for JSON null', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 200
    ctx.res.type = 'application/json'
    ctx.res.body = null
    expect(ctx.res.body).toBe('null')
    expect(ctx.res.status).toBe(200)
    expect(ctx.res.get('content-type')).toBe('application/json')
  })

  it('should not set content-type for URLSearchParams body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const params = new URLSearchParams({ a: '1', b: '2' })
    ctx.res.body = params
    expect(ctx.res.status).toBe(200)
    expect(ctx.res.get('content-type')).toBe('application/x-www-form-urlencoded;charset=UTF-8')
  })

  it('should not set content-type for FormData body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const fd = new FormData()
    fd.append('field', 'value')
    ctx.res.body = fd
    expect(ctx.res.status).toBe(200)
    expect(ctx.res.get('content-type')).toBeNull()
  })

  it('should remove Transfer-Encoding when body is null', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Transfer-Encoding', 'chunked')
    ctx.res.status = 200
    ctx.res.body = null
    expect(ctx.res.get('transfer-encoding')).toBeNull()
    expect(ctx.res.get('content-type')).toBeNull()
  })

  it('should copy status and headers from Response body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const inner = new Response('hi', { status: 202, headers: { 'X-Foo': 'foo' } })
    ctx.res.body = inner
    expect(ctx.res.status).toBe(202)
    expect(ctx.res.type).toBe('text/plain')
    expect(ctx.res.get('x-foo')).toBe('foo')
  })

  it('should remove Content-Length when body is null', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Length', '10')
    ctx.res.body = null
    expect(ctx.res.get('content-length')).toBeNull()
  })

  it('should set octet-stream for ArrayBuffer body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const ab = new ArrayBuffer(4)
    ctx.res.body = ab
    expect(ctx.res.type).toBe('application/octet-stream')
  })

  it('should preserve existing Content-Type for Blob body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'text/plain')
    const blob = new Blob(['{"a":1}'], { type: 'application/json' })
    ctx.res.body = blob
    expect(ctx.res.get('content-type')).toBe('text/plain')
  })

  it('should preserve existing Content-Type for ArrayBuffer body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'text/plain')
    const ab = new ArrayBuffer(2)
    ctx.res.body = ab
    expect(ctx.res.get('content-type')).toBe('text/plain')
  })

  it('should overwrite Content-Type with Response headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'text/plain')
    const inner = new Response('ok', { status: 202, headers: { 'Content-Type': 'application/json' } })
    ctx.res.body = inner
    expect(ctx.res.get('content-type')).toBe('application/json')
    expect(ctx.res.status).toBe(202)
  })

  it('should initialize headers from Response body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const inner = new Response('data', { status: 201, headers: { 'X-Foo': 'foo', 'Content-Type': 'text/plain' } })
    ctx.res.body = inner
    expect(ctx.res.status).toBe(201)
    expect(ctx.res.get('x-foo')).toBe('foo')
    expect(ctx.res.get('content-type')).toBe('text/plain')
  })

  it('should not reinitialize existing headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Foo', 'foo')
    const prev = ctx.res._headers
    const inner = new Response('ok', { status: 206, headers: { 'X-Bar': 'bar' } })
    ctx.res.body = inner
    expect(ctx.res._headers).toBe(prev)
    expect(ctx.res.get('x-foo')).toBe('foo')
    expect(ctx.res.get('x-bar')).toBe('bar')
    expect(ctx.res.status).toBe(206)
  })
})
