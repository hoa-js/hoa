import Hoa from '../../src/application.js'

describe('req.set(name, value)', () => {
  it('should set single header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.req.set('X-Foo', 'foo')
    expect(ctx.req.get('X-Foo')).toBe('foo')
    expect(ctx.req.headers['x-foo']).toBe('foo')
  })

  it('should set headers from object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.req.set({ 'X-Foo': 'foo', 'X-Bar': 'bar' })
    expect(ctx.req.get('X-Foo')).toBe('foo')
    expect(ctx.req.headers['x-bar']).toBe('bar')
  })

  it('should not throw for empty field name', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => ctx.req.set('', 'x')).not.toThrow()
    expect(ctx.req.get('')).toBeNull()
  })

  it('should not throw for null/undefined field name', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => ctx.req.set(null, 'x')).not.toThrow()
    expect(() => ctx.req.set(undefined, 'x')).not.toThrow()
    expect(ctx.req.get(null)).toBeNull()
    expect(ctx.req.get(undefined)).toBeNull()
  })

  it('should not throw for empty object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => ctx.req.set({})).not.toThrow()
  })
})
