import Hoa from '../../src/hoa.js'

describe('req.delete(name)', () => {
  it('should initialize headers store on first call', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => ctx.req.delete('X-Foo')).not.toThrow()
    expect(ctx.req.get('X-Foo')).toBeNull()
  })

  it('should delete existing header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: { 'X-Bar': 'abc' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.get('X-Bar')).toBe('abc')
    ctx.req.delete('X-Bar')
    expect(ctx.req.get('X-Bar')).toBeNull()
  })

  it('should not throw for invalid field names', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => {
      ctx.req.delete('')
      ctx.req.delete(null)
      ctx.req.delete(undefined)
    }).not.toThrow()
  })

  it('should handle case-insensitive header deletion', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.req.set('X-FOO', 'foo')
    expect(ctx.req.get('X-Foo')).toBe('foo')
    ctx.req.delete('x-foo')
    expect(ctx.req.get('X-Foo')).toBeNull()
  })
})
