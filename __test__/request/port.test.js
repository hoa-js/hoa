import Hoa from '../../src/application.js'

describe('req.port', () => {
  it('should get port', () => {
    const app = new Hoa()
    const request = new Request('https://example.com:8443/path')
    const ctx = app.createContext(request)
    expect(ctx.req.port).toBe('8443')
  })

  it('should return empty string for default port', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/path')
    const ctx = app.createContext(request)
    expect(ctx.req.port).toBe('')
  })

  it('should set port and update host', () => {
    const app = new Hoa()
    const request = new Request('http://example.com/path')
    const ctx = app.createContext(request)
    ctx.req.port = '8080'
    expect(ctx.req.port).toBe('8080')
    expect(ctx.req.host).toBe('example.com:8080')
  })
})
