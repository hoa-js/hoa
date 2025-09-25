import Hoa from '../../src/application.js'

describe('app.HoaRequest', () => {
  it('should support extending with properties and methods', async () => {
    const app = new Hoa()

    app.HoaRequest.prototype.message = 'Hello, Hoa!'
    app.HoaRequest.prototype.helper = function () {
      return 'request helper result'
    }
    app.HoaRequest.prototype.isJson = function () {
      return this.get('content-type') === 'application/json'
    }

    app.use(async (ctx) => {
      expect(ctx.req.message).toBe('Hello, Hoa!')
      expect(ctx.req.helper()).toBe('request helper result')
      expect(ctx.req.isJson()).toBe(true)
      ctx.res.status = 204
    })

    const res = await app.fetch(new Request('https://example.com/', {
      headers: { 'content-type': 'application/json' }
    }))
    expect(res.status).toBe(204)
  })

  it('should share extensions across app instances and requests', async () => {
    const app1 = new Hoa()
    const app2 = new Hoa()

    app1.HoaRequest.prototype.message = 'shared'
    app1.HoaRequest.prototype.requestCount = 0
    app1.HoaRequest.prototype.increment = function () {
      return ++this.constructor.prototype.requestCount
    }

    app1.use(async (ctx) => {
      const count = ctx.req.increment()
      ctx.res.body = `app1:${ctx.req.message}:${count}`
    })

    app2.use(async (ctx) => {
      const count = ctx.req.increment()
      ctx.res.body = `app2:${ctx.req.message}:${count}`
    })

    const res1 = await app1.fetch(new Request('https://example.com/'))
    expect(await res1.text()).toBe('app1:shared:1')

    const res2 = await app2.fetch(new Request('https://example.com/'))
    expect(await res2.text()).toBe('app2:shared:2')
  })

  it('should support complex extensions and per-request overrides', async () => {
    const app = new Hoa()

    app.HoaRequest.prototype.apiVersion = 'v1'
    app.HoaRequest.prototype.validate = function (rules) {
      if (rules.requireAuth && !this.get('authorization')) {
        this.ctx.throw(401, 'Authorization required')
      }
    }

    app.use(async (ctx) => {
      ctx.req.validate({ requireAuth: true })
      expect(ctx.req.apiVersion).toBe('v1')
      ctx.req.apiVersion = 'v2'
      ctx.res.body = { apiVersion: ctx.req.apiVersion }
    })

    const res1 = await app.fetch(new Request('https://example.com/'))
    expect(res1.status).toBe(401)

    const res2 = await app.fetch(new Request('https://example.com/', {
      headers: { authorization: 'Bearer token' }
    }))
    expect(res2.status).toBe(200)
    const body = await res2.json()
    expect(body.apiVersion).toBe('v2')
  })
})
