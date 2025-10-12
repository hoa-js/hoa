import Hoa from '../../src/hoa.js'

describe('req.hash', () => {
  it('should get hash', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/page#section')
    const ctx = app.createContext(request)
    expect(ctx.req.hash).toBe('#section')
  })

  it('should set hash', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/page#old')
    const ctx = app.createContext(request)
    ctx.req.hash = '#new'
    expect(ctx.req.hash).toBe('#new')
    expect(ctx.req.href).toBe('https://example.com/page#new')
  })

  it('should handle falsy hash values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/page#hash')
    const ctx = app.createContext(request)
    ctx.req.hash = null
    expect(ctx.req.hash).toBe('')
    expect(ctx.req.href).toBe('https://example.com/page')
  })
})
