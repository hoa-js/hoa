import Hoa from '../../src/application.js'

describe('req.ip', () => {
  it('should extract IP from X-Forwarded-For', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { 'x-forwarded-for': '127.0.0.1, 10.0.0.2' } })
    const ctx = app.createContext(request)
    expect(ctx.req.ip).toBe('127.0.0.1')
  })

  it('should extract IP from X-Real-IP', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { 'x-real-ip': '203.0.113.5' } })
    const ctx = app.createContext(request)
    expect(ctx.req.ip).toBe('203.0.113.5')
  })

  it('should return empty string when no headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.req.ip).toBe('')
  })

  it('should fallback when x-forwarded-for is empty', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: {
        'x-forwarded-for': ' , 10.0.0.2',
        'x-real-ip': '198.51.100.7'
      }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.ip).toBe('198.51.100.7')
  })

  it('should return empty string for completely empty x-forwarded-for', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { 'x-forwarded-for': ' , ' } })
    const ctx = app.createContext(request)
    expect(ctx.req.ip).toBe('')
  })
})
