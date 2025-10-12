import Hoa from '../../src/hoa.js'

describe('res.back(alt)', () => {
  it('should redirect to relative referrer', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { referrer: '/login' } })
    const ctx = app.createContext(request)
    ctx.res.back()
    expect(ctx.res.get('location')).toBe('/login')
    expect(ctx.res.status).toBe(302)
  })

  it('should redirect to same-origin referrer', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/current', { headers: { referrer: 'https://example.com/previous' } })
    const ctx = app.createContext(request)
    ctx.res.back()
    expect(ctx.res.get('location')).toBe('https://example.com/previous')
  })

  it('should reject cross-origin referrer and use fallback', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/current', { headers: { referrer: 'https://malicious.com/evil' } })
    const ctx = app.createContext(request)
    ctx.res.back('/safe')
    expect(ctx.res.get('location')).toBe('/safe')
  })

  it('should use referer header (alternative spelling)', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { referer: '/previous' } })
    const ctx = app.createContext(request)
    ctx.res.back()
    expect(ctx.res.get('location')).toBe('/previous')
  })

  it('should use custom fallback when provided', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.back('/index.html')
    expect(ctx.res.get('location')).toBe('/index.html')
  })

  it('should default to "/" when no referrer', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.back()
    expect(ctx.res.get('location')).toBe('/')
  })
})
