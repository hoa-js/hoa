import Hoa from '../../src/hoa.js'

describe('app', () => {
  it('should initialize with correct defaults', () => {
    const app = new Hoa()
    expect(app.name).toBe('Hoa')
    expect(app.middlewares).toEqual([])
    expect(app.HoaRequest).toBeDefined()
    expect(app.HoaResponse).toBeDefined()
    expect(app.HoaContext).toBeDefined()
    expect(typeof app.fetch).toBe('function')
  })

  it('should accept custom name', () => {
    const customApp = new Hoa({ name: 'MyApp' })
    expect(customApp.name).toBe('MyApp')
  })

  it('should handle text responses', async () => {
    const app = new Hoa()
    app.use(async (ctx) => {
      ctx.res.body = 'Hello, Hoa!'
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello, Hoa!')
  })

  it('should handle JSON responses', async () => {
    const app = new Hoa()
    app.use(async (ctx) => {
      ctx.res.body = { message: 'Hello, Hoa!' }
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/json')
    expect(await res.json()).toEqual({ message: 'Hello, Hoa!' })
  })

  it('should handle HTTP errors', async () => {
    const app = new Hoa()
    app.use(async (ctx) => {
      ctx.throw(400, 'Bad Request')
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(400)
    expect(res.headers.get('content-type')).toBe('text/plain;charset=UTF-8')
    expect(await res.text()).toBe('Bad Request')
  })

  it('should handle unhandled exceptions', async () => {
    const app = new Hoa()
    app.use(async (ctx) => {
      throw new Error('Unhandled error')
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal Server Error')
  })

  it('should have static default getter for ESM/CJS interop', () => {
    expect(Hoa.default).toBe(Hoa)
  })
})
