import Hoa from '../../src/hoa.js'

describe('req.host', () => {
  it('should get host with port', () => {
    const app = new Hoa()
    const request = new Request('https://foo.com:3000/path')
    const ctx = app.createContext(request)
    expect(ctx.req.host).toBe('foo.com:3000')
  })

  it('should get host without port for standard ports', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/path')
    const ctx = app.createContext(request)
    expect(ctx.req.host).toBe('example.com')
  })

  it('should get host with localhost', () => {
    const app = new Hoa()
    const request = new Request('http://localhost:8080/api')
    const ctx = app.createContext(request)
    expect(ctx.req.host).toBe('localhost:8080')
  })

  it('should get host with IP addresses', () => {
    const app = new Hoa()
    const request = new Request('http://192.168.1.1:3000/test')
    const ctx = app.createContext(request)
    expect(ctx.req.host).toBe('192.168.1.1:3000')
  })

  it('should get host with IPv6 addresses', () => {
    const app = new Hoa()
    const request = new Request('http://[::1]:8080/api')
    const ctx = app.createContext(request)
    expect(ctx.req.host).toBe('[::1]:8080')
  })

  it('should set host', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/path')
    const ctx = app.createContext(request)
    ctx.req.host = 'newhost.com:9000'
    expect(ctx.req.host).toBe('newhost.com:9000')
    expect(ctx.req.href).toBe('https://newhost.com:9000/path')
  })

  it('should prioritize URL over host header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/path', { headers: { host: 'custom.example.com:8443' } })
    const ctx = app.createContext(request)
    expect(ctx.req.host).toBe('example.com')
    expect(ctx.req.get('host')).toBe('custom.example.com:8443')
  })

  it('should handle subdomain changes', () => {
    const app = new Hoa()
    const request = new Request('https://api.example.com/v1/users')
    const ctx = app.createContext(request)
    expect(ctx.req.host).toBe('api.example.com')
    ctx.req.host = 'www.example.com'
    expect(ctx.req.host).toBe('www.example.com')
    expect(ctx.req.pathname).toBe('/v1/users')
  })

  it('should not throw when host is invalid', () => {
    const app = new Hoa()
    const request = new Request('https://example.com')
    const ctx = app.createContext(request)
    ctx.req.host = 'invalid host'
    expect(ctx.req.host).toBe('example.com')
  })
})
