import Hoa from '../../src/hoa.js'

describe('req.get(name)', () => {
  it('should be case-insensitive', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: {
        host: 'http://google.com'
      }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.get('HOST')).toBe('http://google.com')
    expect(ctx.req.get('Host')).toBe('http://google.com')
    expect(ctx.req.get('host')).toBe('http://google.com')
  })

  it('should handle referrer/referer alias', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: {
        referer: 'http://google.com'
      }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.get('referer')).toBe('http://google.com')
    expect(ctx.req.get('referrer')).toBe('http://google.com')
  })

  it('should return null for missing headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.req.get('missing-header')).toBeNull()
    expect(ctx.req.get('')).toBeNull()
    expect(ctx.req.get(null)).toBeNull()
    expect(ctx.req.get(undefined)).toBeNull()
  })
})
