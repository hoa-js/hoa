import Hoa from '../../src/application.js'

describe('res.redirect(url)', () => {
  it('should perform basic redirect', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.redirect('http://google.com')
    expect(ctx.res.status).toBe(302)
    expect(ctx.res.get('location')).toBe('http://google.com/')
  })

  it('should format URL before redirect', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.redirect('http://google.com\\@apple.com')
    expect(ctx.res.status).toBe(302)
    expect(ctx.res.get('location')).toBe('http://google.com/@apple.com')
  })

  it('should format URL case insensitively', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.redirect('HTTP://google.com\\@apple.com')
    expect(ctx.res.status).toBe(302)
    expect(ctx.res.get('location')).toBe('http://google.com/@apple.com')
  })

  it('should auto encode URL', async () => {
    const app = new Hoa()
    app.use(async (ctx) => {
      ctx.res.redirect('http://google.com/😓')
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('http://google.com/%F0%9F%98%93')
  })

  it('should handle relative URLs', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.redirect('/login')
    expect(ctx.res.status).toBe(302)
    expect(ctx.res.get('location')).toBe('/login')
  })

  it('should handle query parameters', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.redirect('/search?q=test&page=1')
    expect(ctx.res.status).toBe(302)
    expect(ctx.res.get('location')).toBe('/search?q=test&page=1')
  })

  it('should set redirect body', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.redirect('http://google.com/')
    expect(ctx.res.type).toBe('text/plain')
    expect(ctx.res.body).toBe('Redirecting to http://google.com/.')
  })

  it('should preserve existing redirect status', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 301 // Permanent redirect
    ctx.res.redirect('http://google.com')
    expect(ctx.res.status).toBe(301)
    expect(ctx.res.get('location')).toBe('http://google.com/')
  })

  it('should set 302 status for non-redirect status codes', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 200
    ctx.res.redirect('http://google.com')
    expect(ctx.res.status).toBe(302)
    expect(ctx.res.get('location')).toBe('http://google.com/')
  })
})
