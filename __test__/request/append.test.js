import Hoa from '../../src/hoa.js'

describe('req.append(name, value)', () => {
  it('should append multiple values to the same header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.req.append('Set-Cookie', 'a=1')
    ctx.req.append('Set-Cookie', 'b=2')
    expect(ctx.req.get('Set-Cookie')).toBe('a=1, b=2')
  })

  it('should append headers from object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.req.append({ 'X-Foo': 'foo', 'X-Bar': 'bar' })
    expect(ctx.req.get('x-foo')).toBe('foo')
    expect(ctx.req.get('x-bar')).toBe('bar')
  })

  it('should not throw for invalid field names', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => {
      ctx.req.append('', 'x')
      ctx.req.append(null, 'x')
      ctx.req.append(undefined, 'x')
    }).not.toThrow()
    expect(ctx.req.get('')).toBeNull()
    expect(ctx.req.get(null)).toBeNull()
    expect(ctx.req.get(undefined)).toBeNull()
  })
})
