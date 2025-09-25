import Hoa from '../../src/application.js'

describe('req.protocol', () => {
  it('should get https protocol', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/path')
    const ctx = app.createContext(request)
    expect(ctx.req.protocol).toBe('https:')
  })

  it('should get http protocol', () => {
    const app = new Hoa()
    const request = new Request('http://example.com/path')
    const ctx = app.createContext(request)
    expect(ctx.req.protocol).toBe('http:')
  })

  it('should set protocol and update href', () => {
    const app = new Hoa()
    const request = new Request('http://example.com/path')
    const ctx = app.createContext(request)
    ctx.req.protocol = 'https:'
    expect(ctx.req.protocol).toBe('https:')
    expect(ctx.req.href).toBe('https://example.com/path')
  })

  it('should get custom protocol', () => {
    const app = new Hoa()
    const request = new Request('ftp://example.com/file')
    const ctx = app.createContext(request)
    expect(ctx.req.protocol).toBe('ftp:')
  })
})
