import Hoa from '../../src/application.js'

describe('req.hostname', () => {
  it('should get hostname without port', () => {
    const app = new Hoa()
    const request = new Request('https://foo.com:3000/path')
    const ctx = app.createContext(request)
    expect(ctx.req.hostname).toBe('foo.com')
  })

  it('should get hostname for standard ports', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/path')
    const ctx = app.createContext(request)
    expect(ctx.req.hostname).toBe('example.com')
  })

  it('should get hostname for localhost', () => {
    const app = new Hoa()
    const request = new Request('http://localhost:8080/api')
    const ctx = app.createContext(request)
    expect(ctx.req.hostname).toBe('localhost')
  })

  it('should get hostname for IP addresses', () => {
    const app = new Hoa()
    const request = new Request('http://192.168.1.1:3000/test')
    const ctx = app.createContext(request)
    expect(ctx.req.hostname).toBe('192.168.1.1')
  })

  it('should get hostname for IPv6 addresses', () => {
    const app = new Hoa()
    const request = new Request('http://[::1]:8080/path')
    const ctx = app.createContext(request)
    expect(ctx.req.hostname).toBe('::1')
  })

  it('should set hostname', () => {
    const app = new Hoa()
    const request = new Request('https://old.example.com:8443/path')
    const ctx = app.createContext(request)
    ctx.req.hostname = 'new.example.com'
    expect(ctx.req.hostname).toBe('new.example.com')
    expect(ctx.req.href).toBe('https://new.example.com:8443/path')
  })

  it('should handle subdomain changes', () => {
    const app = new Hoa()
    const request = new Request('https://api.example.com/users')
    const ctx = app.createContext(request)
    ctx.req.hostname = 'www.example.com'
    expect(ctx.req.hostname).toBe('www.example.com')
    expect(ctx.req.pathname).toBe('/users')
  })

  it('should handle international domain names', () => {
    const app = new Hoa()
    const request = new Request('https://测试.example.com/path')
    const ctx = app.createContext(request)
    expect(ctx.req.hostname).toBe('xn--0zwm56d.example.com')
  })
})
