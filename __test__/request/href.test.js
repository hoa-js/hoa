import Hoa from '../../src/application.js'

describe('req.href', () => {
  it('should get HTTP URL', () => {
    const app = new Hoa()
    const request = new Request('http://localhost/users/1?next=/dashboard')
    const ctx = app.createContext(request)
    expect(ctx.req.href).toBe('http://localhost/users/1?next=/dashboard')
  })

  it('should get HTTPS URL', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api/v1/users?page=1')
    const ctx = app.createContext(request)
    expect(ctx.req.href).toBe('https://example.com/api/v1/users?page=1')
  })

  it('should get URL with port', () => {
    const app = new Hoa()
    const request = new Request('http://localhost:3000/dashboard')
    const ctx = app.createContext(request)
    expect(ctx.req.href).toBe('http://localhost:3000/dashboard')
  })

  it('should get URL with hash', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/page#section')
    const ctx = app.createContext(request)
    expect(ctx.req.href).toBe('https://example.com/page#section')
  })

  it('should get complex URL', () => {
    const app = new Hoa()
    const request = new Request('https://api.example.com:8443/v1/users/123?include=profile&sort=name#details')
    const ctx = app.createContext(request)
    expect(ctx.req.href).toBe('https://api.example.com:8443/v1/users/123?include=profile&sort=name#details')
  })

  it('should set href and update URL components', () => {
    const app = new Hoa()
    const request = new Request('http://localhost/old')
    const ctx = app.createContext(request)
    ctx.req.href = 'https://example.com/new/path?param=value'
    expect(ctx.req.href).toBe('https://example.com/new/path?param=value')
    expect(ctx.req.protocol).toBe('https:')
    expect(ctx.req.host).toBe('example.com')
    expect(ctx.req.pathname).toBe('/new/path')
    expect(ctx.req.search).toBe('?param=value')
    expect(ctx.req.hash).toBe('')
  })

  it('should handle encoded characters', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/search?q=hello%20hoa&type=user')
    const ctx = app.createContext(request)
    expect(ctx.req.href).toBe('https://example.com/search?q=hello%20hoa&type=user')
  })

  it('should handle international domain names', () => {
    const app = new Hoa()
    const request = new Request('https://测试.example.com/path')
    const ctx = app.createContext(request)
    expect(ctx.req.href).toBe('https://xn--0zwm56d.example.com/path')
  })
})
