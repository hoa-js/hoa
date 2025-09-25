import Hoa from '../../src/application.js'

describe('res.status', () => {
  it('should accept valid status codes', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 403
    expect(ctx.res.status).toBe(403)
    expect(() => { ctx.res.status = 200 }).not.toThrow()
    expect(() => { ctx.res.status = 404 }).not.toThrow()
    expect(() => { ctx.res.status = 500 }).not.toThrow()
  })

  it('should set statusText automatically', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 404
    expect(ctx.res.statusText).toBe('Not Found')
    ctx.res.status = 500
    expect(ctx.res.statusText).toBe('Internal Server Error')
  })

  it('should not overwrite explicitly set statusText', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.statusText = 'Everything Ok'
    ctx.res.status = 404
    expect(ctx.res.status).toBe(404)
    expect(ctx.res.statusText).toBe('Everything Ok')
  })

  it('should throw for invalid status codes', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => { ctx.res.status = 99 }).toThrow(/invalid status code: 99/)
    expect(() => { ctx.res.status = 1001 }).toThrow(/invalid status code: 1001/)
    expect(() => { ctx.res.status = 200.5 }).toThrow(/status code must be an integer/)
    expect(() => { ctx.res.status = '200' }).toThrow(/status code must be an integer/)
  })

  it('should clear body for 204 No Content', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.body = 'some content'
    ctx.res.status = 204
    expect(ctx.res.body).toBeNull()
  })

  it('should clear body for 304 Not Modified', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.body = 'some content'
    ctx.res.status = 304
    expect(ctx.res.body).toBeNull()
  })

  it('should preserve body for other status codes', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.body = 'some content'
    ctx.res.status = 200
    expect(ctx.res.body).toBe('some content')
  })

  it('should handle 204 response behavior correctly', async () => {
    const app = new Hoa()
    app.use(async (ctx) => {
      ctx.res.body = { foo: 'bar' }
      ctx.res.set('Content-Type', 'application/json; charset=utf-8')
      ctx.res.set('Content-Length', '15')
      ctx.res.status = 204
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(204)
    expect(res.headers.get('content-type')).toBeNull()
    expect(res.headers.get('content-length')).toBeNull()
    expect(await res.text()).toBe('')
  })

  it('should handle 304 response behavior correctly', async () => {
    const app = new Hoa()
    app.use(async (ctx) => {
      ctx.res.body = 'some content'
      ctx.res.set('Content-Type', 'text/plain')
      ctx.res.status = 304
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(304)
    expect(res.headers.get('content-type')).toBeNull()
    expect(await res.text()).toBe('')
  })
})
