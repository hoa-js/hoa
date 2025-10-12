import Hoa from '../../src/hoa.js'

describe('req.method', () => {
  it('should get request method', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { method: 'POST' })
    const ctx = app.createContext(request)
    expect(ctx.req.method).toBe('POST')
  })

  it('should set request method', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { method: 'GET' })
    const ctx = app.createContext(request)
    expect(ctx.req.method).toBe('GET')
    ctx.req.method = 'PATCH'
    expect(ctx.req.method).toBe('PATCH')
  })
})
