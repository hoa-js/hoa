import Hoa from '../../src/hoa.js'

describe('req.length', () => {
  it('should return content-length value', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.req.set('content-length', '10')
    expect(ctx.req.length).toBe(10)
  })

  it('should return null when no content-length', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.req.length).toBeNull()
  })

  it('should return zero content-length', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.req.set('content-length', '0')
    expect(ctx.req.length).toBe(0)
  })
})
