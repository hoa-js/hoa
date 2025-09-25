import Hoa from '../../src/application.js'

describe('res.get(name)', () => {
  it('should be case insensitive', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Foo', 'bar')
    expect(ctx.res.get('x-FOO')).toBe('bar')
    expect(ctx.res.get('X-Foo')).toBe('bar')
    expect(ctx.res.get('x-foo')).toBe('bar')
  })

  it('should get string header values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'application/json')
    ctx.res.set('Content-Length', '123')
    ctx.res.set('X-FOO', 'foo')
    expect(ctx.res.get('content-type')).toBe('application/json')
    expect(ctx.res.get('content-length')).toBe('123')
    expect(ctx.res.get('x-foo')).toBe('foo')
  })

  it('should get standard HTTP headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Cache-Control', 'no-cache')
    ctx.res.set('Content-Type', 'application/json')
    ctx.res.set('Content-Length', '123')
    expect(ctx.res.get('cache-control')).toBe('no-cache')
    expect(ctx.res.get('content-type')).toBe('application/json')
    expect(ctx.res.get('content-length')).toBe('123')
  })

  it('should return null for non-existent headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.res.get('nonexistent')).toBeNull()
    expect(ctx.res.get('')).toBeNull()
    expect(ctx.res.get('missing-header')).toBeNull()
  })

  it('should handle Set-Cookie header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Set-Cookie', 'session=abc123')
    expect(ctx.res.get('set-cookie')).toBe('session=abc123')
  })

  it('should handle empty string values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Empty', '')
    expect(ctx.res.get('x-empty')).toBe('')
  })

  it('should convert numeric values to strings', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Number', 42)
    ctx.res.set('X-Zero', 0)
    expect(ctx.res.get('x-number')).toBe('42')
    expect(ctx.res.get('x-zero')).toBe('0')
  })

  it('should convert boolean values to strings', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-True', true)
    ctx.res.set('X-False', false)
    expect(ctx.res.get('x-true')).toBe('true')
    expect(ctx.res.get('x-false')).toBe('false')
  })

  it('should handle referrer/referer alias', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('referrer', 'https://example.com')
    expect(ctx.res.get('referer')).toBe('https://example.com')
    expect(ctx.res.get('referrer')).toBe('https://example.com')
  })

  it('should fallback to referer when referrer is not set', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('referer', 'https://fallback.example')
    expect(ctx.res.get('referrer')).toBe('https://fallback.example')
    expect(ctx.res.get('referer')).toBe('https://fallback.example')
  })
})
