import Hoa from '../../src/hoa.js'

describe('ctx.response', () => {
  it('should build text response', async () => {
    const app = new Hoa()
    const ctx = app.createContext(new Request('https://example.com/'))
    ctx.res.body = 'Hello, Hoa!'

    const res = ctx.response
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/plain')
    expect(await res.text()).toBe('Hello, Hoa!')
  })

  it('should build JSON response with content-type', async () => {
    const app = new Hoa()
    const ctx = app.createContext(new Request('https://example.com/'))
    ctx.res.body = { message: 'Hello, Hoa!' }

    const res = ctx.response
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/json')
    expect(await res.json()).toEqual({ message: 'Hello, Hoa!' })
  })

  it('should not send body for HEAD and compute content-length', async () => {
    const app = new Hoa()
    const ctx = app.createContext(new Request('https://example.com/', { method: 'HEAD' }))
    ctx.res.body = 'Hello'

    const res = ctx.response
    expect(res.status).toBe(200)
    expect(res.headers.get('content-length')).toBe('5')
    expect(await res.text()).toBe('')
  })

  it('should handle Response body and inherit status/headers', async () => {
    const app = new Hoa()
    const ctx = app.createContext(new Request('https://example.com/'))
    ctx.res.body = new Response('Hello, Hoa!', {
      status: 201,
      headers: { 'X-Bar': 'bar' }
    })

    const res = ctx.response
    expect(res.status).toBe(201)
    expect(res.headers.get('x-bar')).toBe('bar')
    expect(await res.text()).toBe('Hello, Hoa!')
  })

  it('should handle explicit null body as 204 with headers cleared', async () => {
    const app = new Hoa()
    const ctx = app.createContext(new Request('https://example.com/'))
    ctx.res.body = null

    const res = ctx.response
    expect(res.status).toBe(204)
    expect(res.headers.get('content-type')).toBeNull()
    expect(res.headers.get('transfer-encoding')).toBeNull()
    expect(res.headers.get('content-length')).toBe('0')
    expect(await res.text()).toBe('')
  })

  it('should ignore body for empty status codes (304)', async () => {
    const app = new Hoa()
    const ctx = app.createContext(new Request('https://example.com/'))
    ctx.res.status = 304
    ctx.res.body = 'Hello, Hoa!'

    const res = ctx.response
    expect(res.status).toBe(304)
    expect(await res.text()).toBe('')
  })
})
