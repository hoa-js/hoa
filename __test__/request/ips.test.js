import Hoa from '../../src/application.js'

describe('req.ips', () => {
  it('should return IP list from x-forwarded-for', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { 'x-forwarded-for': '127.0.0.1, 127.0.0.2' } })
    const ctx = app.createContext(request)
    expect(ctx.req.ips).toEqual(['127.0.0.1', '127.0.0.2'])
  })

  it('should fallback to x-real-ip', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', { headers: { 'x-real-ip': '203.0.113.10' } })
    const ctx = app.createContext(request)
    expect(ctx.req.ips).toEqual(['203.0.113.10'])
  })

  it('should return empty array when no IP info', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.req.ips).toEqual([])
  })

  it('should parse x-forwarded-for in app context', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      ctx.res.body = { ips: ctx.req.ips }
    })

    const res1 = await app.fetch(new Request('https://example.com/', { headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' } }))
    const body1 = await res1.json()
    expect(body1.ips).toEqual(['192.168.1.1', '10.0.0.1'])

    const res2 = await app.fetch(new Request('https://example.com/'))
    const body2 = await res2.json()
    expect(body2.ips).toEqual([])
  })
})
