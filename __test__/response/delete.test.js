import Hoa from '../../src/application.js'

describe('res.delete(name)', () => {
  it('should remove header field', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Foo', 'foo')
    expect(ctx.res.get('x-foo')).toBe('foo')
    ctx.res.delete('x-foo')
    expect(ctx.res.get('x-foo')).toBeNull()
  })

  it('should be case insensitive', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'application/json')
    expect(ctx.res.get('content-type')).toBe('application/json')
    expect(ctx.res.type).toBe('application/json')
    ctx.res.delete('content-type')
    expect(ctx.res.get('content-type')).toBeNull()
    expect(ctx.res.get('Content-Type')).toBeNull()
    expect(ctx.res.type).toBeNull()
  })

  it('should not throw when removing non-existent header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => { ctx.res.delete('non-existent') }).not.toThrow()
  })

  it('should remove headers independently', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Foo', 'foo')
    ctx.res.set('X-Bar', 'bar')
    ctx.res.set('content-type', 'application/json')
    ctx.res.delete('x-foo')
    expect(ctx.res.get('x-foo')).toBeNull()
    expect(ctx.res.get('x-bar')).toBe('bar')
    expect(ctx.res.get('content-type')).toBe('application/json')
  })

  it('should handle standard HTTP headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Cache-Control', 'no-cache')
    ctx.res.set('Content-Type', 'application/json')
    ctx.res.delete('cache-control')
    expect(ctx.res.get('cache-control')).toBeNull()
    expect(ctx.res.get('content-type')).toBe('application/json')
  })

  it('should not throw for empty string header name', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => { ctx.res.delete('') }).not.toThrow()
  })

  it('should handle case-insensitive header deletion', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-FOO', 'foo')
    expect(ctx.res.get('X-Foo')).toBe('foo')
    ctx.res.delete('x-foo')
    expect(ctx.res.get('X-Foo')).toBeNull()
  })
})
