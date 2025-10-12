import Hoa from '../../src/hoa.js'

describe('req.pathname', () => {
  it('should get pathname', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/users/1?x=1')
    const ctx = app.createContext(request)
    expect(ctx.req.pathname).toBe('/users/1')
  })

  it('should set pathname', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/old/path?x=1')
    const ctx = app.createContext(request)
    ctx.req.pathname = '/new/path'
    expect(ctx.req.pathname).toBe('/new/path')
    expect(ctx.req.href).toBe('https://example.com/new/path?x=1')
  })
})
