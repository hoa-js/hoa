import Hoa from '../../src/application.js'

describe('res.statusText', () => {
  it('should return status text for 200', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 200
    expect(ctx.res.statusText).toBe('OK')
  })

  it('should return correct statusText for different status codes', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 404
    expect(ctx.res.statusText).toBe('Not Found')
    ctx.res.status = 500
    expect(ctx.res.statusText).toBe('Internal Server Error')
    ctx.res.status = 201
    expect(ctx.res.statusText).toBe('Created')
    ctx.res.status = 400
    expect(ctx.res.statusText).toBe('Bad Request')
  })

  it('should handle custom status codes', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 418
    expect(ctx.res.statusText).toBe("I'm a Teapot")
  })

  it('should return undefined for unknown status', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 999
    expect(ctx.res.statusText).toBeUndefined()
  })

  it('should set custom status text', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 200
    ctx.res.statusText = 'Custom OK'
    expect(ctx.res.statusText).toBe('Custom OK')
  })

  it('should allow custom statusText for any status', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 404
    ctx.res.statusText = 'Resource Not Available'
    expect(ctx.res.statusText).toBe('Resource Not Available')
    expect(ctx.res.status).toBe(404)
  })

  it('should handle empty statusText', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.statusText = ''
    expect(ctx.res.statusText).toBe('')
  })

  it('should handle non-string values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.statusText = 123
    expect(ctx.res.statusText).toBe(123)
    ctx.res.statusText = null
    expect(ctx.res.statusText).toBeNull()
    ctx.res.statusText = undefined
    expect(ctx.res.statusText).toBeUndefined()
  })
})
