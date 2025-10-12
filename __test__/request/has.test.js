import Hoa from '../../src/hoa.js'

describe('req.has(name)', () => {
  it('should check existing headers case-insensitively', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { 'Content-Type': 'text/plain' } })
    const ctx = app.createContext(request)
    expect(ctx.req.has('content-type')).toBe(true)
    expect(ctx.req.has('CONTENT-TYPE')).toBe(true)
  })

  it('should return false for non-existent headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { 'Content-Type': 'text/plain' } })
    const ctx = app.createContext(request)
    expect(ctx.req.has('x-missing')).toBe(false)
  })

  it('should return false for empty or nullish field names', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { 'Content-Type': 'text/plain' } })
    const ctx = app.createContext(request)
    expect(ctx.req.has('')).toBe(false)
    expect(ctx.req.has(null)).toBe(false)
    expect(ctx.req.has(undefined)).toBe(false)
  })
})
