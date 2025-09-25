import Hoa from '../../src/application.js'

describe('app.HoaResponse', () => {
  it('should support extending with properties and methods', async () => {
    const app = new Hoa()

    app.HoaResponse.prototype.message = 'Hello, Hoa!'
    app.HoaResponse.prototype.helper = function () {
      return 'response helper result'
    }
    app.HoaResponse.prototype.isJson = function () {
      return this.get('content-type') === 'application/json'
    }

    app.use(async (ctx) => {
      expect(ctx.res.message).toBe('Hello, Hoa!')
      expect(ctx.res.helper()).toBe('response helper result')

      ctx.res.type = 'json'
      expect(ctx.res.isJson()).toBe(true)

      ctx.res.status = 204
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(204)
  })

  it('should share extensions across app instances and responses', async () => {
    const app1 = new Hoa()
    const app2 = new Hoa()

    app1.HoaResponse.prototype.message = 'shared'
    app1.HoaResponse.prototype.responseCount = 0
    app1.HoaResponse.prototype.increment = function () {
      return ++this.constructor.prototype.responseCount
    }

    app1.use(async (ctx) => {
      const count = ctx.res.increment()
      ctx.res.body = `app1:${ctx.res.message}:${count}`
    })

    app2.use(async (ctx) => {
      const count = ctx.res.increment()
      ctx.res.body = `app2:${ctx.res.message}:${count}`
    })

    const res1 = await app1.fetch(new Request('https://example.com/'))
    expect(await res1.text()).toBe('app1:shared:1')

    const res2 = await app2.fetch(new Request('https://example.com/'))
    expect(await res2.text()).toBe('app2:shared:2')
  })

  it('should support complex extensions and per-response overrides', async () => {
    const app = new Hoa()

    app.HoaResponse.prototype.apiVersion = 'v1'
    app.HoaResponse.prototype.validate = function (rules) {
      if (rules.requireAuth && !this.ctx.req.get('authorization')) {
        this.ctx.throw(401, 'Authorization required')
      }
    }

    app.use(async (ctx) => {
      ctx.res.validate({ requireAuth: true })
      expect(ctx.res.apiVersion).toBe('v1')
      ctx.res.apiVersion = 'v2'
      ctx.res.body = { apiVersion: ctx.res.apiVersion }
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
