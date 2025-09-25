import Hoa from '../../src/application.js'

describe('req.origin', () => {
  it('should get origin', () => {
    const app = new Hoa()
    const request = new Request('http://example.com/users/1?next=/dashboard')
    const ctx = app.createContext(request)
    expect(ctx.req.origin).toBe('http://example.com')
  })

  it('should get origin with different port', () => {
    const app = new Hoa()
    const request = new Request('https://api.example.com:8443/v1/users')
    const ctx = app.createContext(request)
    expect(ctx.req.origin).toBe('https://api.example.com:8443')
  })

  it('should get origin with localhost', () => {
    const app = new Hoa()
    const request = new Request('http://localhost:3000/api/test')
    const ctx = app.createContext(request)
    expect(ctx.req.origin).toBe('http://localhost:3000')
  })

  it('should set origin and preserve path', () => {
    const app = new Hoa()
    const request = new Request('http://example.com/users/1?next=/dashboard')
    const ctx = app.createContext(request)
    ctx.req.origin = 'https://example1.com:8080'
    expect(ctx.req.origin).toBe('https://example1.com:8080')
    ctx.req.origin = 'https://example2.com:443'
    expect(ctx.req.origin).toBe('https://example2.com')
    ctx.req.href = 'https://example3.com:443/path'
    expect(ctx.req.origin).toBe('https://example3.com')
  })
})
