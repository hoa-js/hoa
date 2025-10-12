import Hoa from '../../src/hoa.js'

describe('res.has(name)', () => {
  it('should be case insensitive', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Foo', '')
    expect(ctx.res.has('x-Foo')).toBe(true)
    expect(ctx.res.has('x-foo')).toBe(true)
    expect(ctx.res.has('X-FOO')).toBe(true)
  })

  it('should return false for non-existent headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.res.has('x-foo')).toBe(false)
  })

  it('should return true for empty string values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Empty', '')
    expect(ctx.res.has('x-empty')).toBe(true)
  })

  it('should return true for zero values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Zero', 0)
    expect(ctx.res.has('x-zero')).toBe(true)
  })

  it('should return true for false values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-False', false)
    expect(ctx.res.has('x-false')).toBe(true)
  })

  it('should check standard HTTP headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'application/json')
    ctx.res.set('Cache-Control', 'no-cache')
    expect(ctx.res.has('content-type')).toBe(true)
    expect(ctx.res.has('CONTENT-TYPE')).toBe(true)
    expect(ctx.res.has('cache-control')).toBe(true)
    expect(ctx.res.has('content-length')).toBe(false)
  })

  it('should handle case-insensitive header deletion', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Foo', 'foo')
    expect(ctx.res.has('x-foo')).toBe(true)
    expect(ctx.res.has('X-FOO')).toBe(true)
    expect(ctx.res.has('x-foo-1')).toBe(false)
  })

  it('should return true for null and undefined values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Null', null)
    ctx.res.set('X-Undefined', undefined)
    expect(ctx.res.has('x-null')).toBe(true)
    expect(ctx.res.has('x-undefined')).toBe(true)
  })

  it('should return false for empty header name', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.res.has('')).toBe(false)
    expect(ctx.res.has(null)).toBe(false)
    expect(ctx.res.has(undefined)).toBe(false)
    expect(ctx.res.has(false)).toBe(false)
    expect(ctx.res.has(0)).toBe(false)
  })

  it('should return false after removing headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Foo', 'bar')
    expect(ctx.res.has('x-foo')).toBe(true)
    ctx.res.delete('x-foo')
    expect(ctx.res.has('x-foo')).toBe(false)
  })
})
