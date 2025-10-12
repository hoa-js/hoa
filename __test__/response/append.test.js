import Hoa from '../../src/hoa.js'

describe('res.append(name, value)', () => {
  it('should append multiple values to same header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.append('x-foo', 'bar1')
    ctx.res.append('x-foo', 'bar2')
    expect(ctx.res.headers['x-foo']).toBe('bar1, bar2')
  })

  it('should handle Set-Cookie header specially', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.append('Set-Cookie', 'foo=bar')
    ctx.res.append('Set-Cookie', 'fizz=buzz')
    ctx.res.append('Set-Cookie', 'hi=again')
    expect(ctx.res.headers['set-cookie']).toBe('hi=again')
    expect(ctx.res.get('Set-Cookie')).toBe('foo=bar, fizz=buzz, hi=again')
    expect([...ctx.res._headers.entries()]).toEqual([
      ['set-cookie', 'foo=bar'],
      ['set-cookie', 'fizz=buzz'],
      ['set-cookie', 'hi=again']
    ])
  })

  it('should be reset by res.set()', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.append('Link', '<http://localhost/>')
    ctx.res.append('Link', '<http://localhost:80/>')
    ctx.res.set('Link', '<http://127.0.0.1/>')
    expect(ctx.res.headers.link).toBe('<http://127.0.0.1/>')
  })

  it('should work with res.set() first', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Link', '<http://localhost/>')
    ctx.res.append('Link', '<http://localhost:80/>')
    expect(ctx.res.headers.link).toBe('<http://localhost/>, <http://localhost:80/>')
  })

  it('should append headers from object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.append({ 'X-Foo': 'foo', 'X-Bar': 'bar' })
    expect(ctx.res.get('x-foo')).toBe('foo')
    expect(ctx.res.get('x-bar')).toBe('bar')
  })

  it('should not throw for empty field name', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => ctx.res.append('', 'x')).not.toThrow()
    expect(ctx.res.get('')).toBeNull()
  })

  it('should not throw for null/undefined field name', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => ctx.res.append(null, 'x')).not.toThrow()
    expect(() => ctx.res.append(undefined, 'x')).not.toThrow()
  })
})
