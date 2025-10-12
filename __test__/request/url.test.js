import Hoa from '../../src/hoa.js'

describe('req.url', () => {
  it('should get URL as URL instance', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/users/1?next=/dashboard#top')
    const ctx = app.createContext(request)
    const url = ctx.req.url
    expect(url).toBeInstanceOf(URL)
    expect(url.protocol).toBe('https:')
    expect(url.host).toBe('example.com')
    expect(url.pathname).toBe('/users/1')
    expect(url.search).toBe('?next=/dashboard')
    expect(url.hash).toBe('#top')
  })

  it('should set URL with string', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/old')
    const ctx = app.createContext(request)
    ctx.req.url = 'http://localhost:3000/new?x=1#h'
    expect(ctx.req.href).toBe('http://localhost:3000/new?x=1#h')
    expect(ctx.req.protocol).toBe('http:')
    expect(ctx.req.host).toBe('localhost:3000')
    expect(ctx.req.pathname).toBe('/new')
    expect(ctx.req.search).toBe('?x=1')
    expect(ctx.req.hash).toBe('#h')
  })

  it('should set URL with URL instance', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/old')
    const ctx = app.createContext(request)
    const u = new URL('https://api.example.com/v1?id=123')
    ctx.req.url = u
    expect(ctx.req.href).toBe('https://api.example.com/v1?id=123')
    expect(ctx.req.hostname).toBe('api.example.com')
    expect(ctx.req.pathname).toBe('/v1')
    expect(ctx.req.search).toBe('?id=123')
    expect(ctx.req.hash).toBe('')
  })
})
