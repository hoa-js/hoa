import Hoa from '../../src/application.js'

describe('req.type', () => {
  it('should return text/html type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api', {
      headers: { 'content-type': 'text/html; charset=utf-8' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('text/html')
  })

  it('should return null when no content-type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBeNull()
  })

  it('should return application/json type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api', {
      headers: { 'content-type': 'application/json' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('application/json')
  })

  it('should return application/json type with charset', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api', {
      headers: { 'content-type': 'application/json; charset=utf-8' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('application/json')
  })

  it('should return multipart/form-data type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/upload', {
      headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('multipart/form-data')
  })

  it('should return application/x-www-form-urlencoded type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/form', {
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('application/x-www-form-urlencoded')
  })

  it('should return text/plain type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/text', {
      headers: { 'content-type': 'text/plain; charset=iso-8859-1' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('text/plain')
  })

  it('should be case insensitive', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api', {
      headers: { 'Content-Type': 'APPLICATION/JSON; CHARSET=UTF-8' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('application/json')
  })

  it('should handle custom content types', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api', {
      headers: { 'content-type': 'application/vnd.api+json' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('application/vnd.api+json')
  })

  it('should handle whitespace in content-type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api', {
      headers: { 'content-type': '  application/json  ; charset=utf-8  ' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBe('application/json')
  })

  it('should return null for empty content-type', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api', {
      headers: { 'content-type': '' }
    })
    const ctx = app.createContext(request)
    expect(ctx.req.type).toBeNull()
  })
})
