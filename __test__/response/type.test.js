import Hoa from '../../src/application.js'

describe('res.type', () => {
  it('should set mime type directly', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.type = 'text/plain'
    expect(ctx.res.type).toBe('text/plain')
    expect(ctx.res.get('content-type')).toBe('text/plain')
  })

  it('should lookup mime by extension alias', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.type = 'json'
    expect(ctx.res.type).toBe('application/json')
    expect(ctx.res.get('content-type')).toBe('application/json')
  })

  it('should handle html alias', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.type = 'html'
    expect(ctx.res.type).toBe('text/html')
    expect(ctx.res.get('content-type')).toBe('text/html;charset=UTF-8')
  })

  it('should handle text alias', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.type = 'text'
    expect(ctx.res.type).toBe('text/plain')
    expect(ctx.res.get('content-type')).toBe('text/plain;charset=UTF-8')
  })

  it('should set full mime type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.type = 'application/vnd.api+json'
    expect(ctx.res.type).toBe('application/vnd.api+json')
    expect(ctx.res.get('content-type')).toBe('application/vnd.api+json')
  })

  it('should get content type without parameters', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'text/html; charset=utf-8')
    expect(ctx.res.type).toBe('text/html')
  })

  it('should return null when no content-type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.res.type).toBeNull()
  })

  it('should ignore setting type to undefined', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'application/json')
    ctx.res.type = undefined
    expect(ctx.res.get('content-type')).toBe('application/json')
  })

  it('should ignore setting type to null', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'text/plain')
    ctx.res.type = null
    expect(ctx.res.get('content-type')).toBe('text/plain')
  })
})
