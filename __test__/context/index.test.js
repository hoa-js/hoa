import Hoa from '../../src/hoa.js'

describe('ctx', () => {
  it('should create context instances with various options', async () => {
    const app = new Hoa()
    const req = new Request('https://example.com/')
    const env = {
      KV: {
        get: async (key) => { /* mock get */ },
        set: async (key, value) => { /* mock set */ }
      }
    }
    const executionCtx = {
      waitUntil: (promise) => { /* mock waitUntil */ }
    }

    const ctxWithOptions = app.createContext(req, env, executionCtx)
    expect(ctxWithOptions.request).toBe(req)
    expect(ctxWithOptions.env).toBe(env)
    expect(ctxWithOptions.executionCtx).toBe(executionCtx)
    expect(Object.getPrototypeOf(ctxWithOptions.state)).toBeNull()

    expect(typeof ctxWithOptions.env.KV.get).toBe('function')
    expect(typeof ctxWithOptions.env.KV.set).toBe('function')

    expect(typeof ctxWithOptions.executionCtx.waitUntil).toBe('function')

    const ctxWithoutOptions = app.createContext()
    expect(ctxWithoutOptions.request).toBeUndefined()
    expect(ctxWithoutOptions.env).toBeUndefined()
    expect(ctxWithoutOptions.executionCtx).toBeUndefined()
    expect(Object.getPrototypeOf(ctxWithoutOptions.state)).toBeNull()

    const directCtx = new app.HoaContext()
    expect(directCtx.request).toBeUndefined()
    expect(Object.getPrototypeOf(directCtx.state)).toBeNull()
  })

  it('should work with Cloudflare Workers environment', async () => {
    const app = new Hoa()

    const cache = {}
    const env = {
      KV: {
        get: async (key) => {
          return cache[key]
        },
        set: async (key, value) => {
          cache[key] = value
        }
      }
    }

    const executionCtx = {
      waitUntil: (promise) => {
        return promise
      },
      passThroughOnException: () => {
      }
    }

    app.use(async (ctx) => {
      expect(await ctx.env.KV.get('user:123')).toBeUndefined()
      await ctx.env.KV.set('user:123', 123)
      expect(await ctx.env.KV.get('user:123')).toBe(123)

      ctx.executionCtx.waitUntil(
        ctx.env.KV.set('analytics', JSON.stringify({ path: ctx.req.pathname, timestamp: Date.now() }))
      )
      ctx.res.body = 'Cloudflare Workers environment working!'
    })

    const req = new Request('https://example.com/api/test')
    const res = await app.fetch(req, env, executionCtx)

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Cloudflare Workers environment working!')
  })

  it('should share prototype extensions across application instances', async () => {
    const app1 = new Hoa()
    const app2 = new Hoa()

    app1.HoaContext.prototype.msg = 'shared'

    app1.use(async (ctx) => {
      ctx.res.body = ctx.msg
    })

    app2.use(async (ctx) => {
      ctx.res.body = ctx.msg
    })

    const res1 = await app1.fetch(new Request('https://example.com/'))
    expect(await res1.text()).toBe('shared')

    const res2 = await app2.fetch(new Request('https://example.com/'))
    expect(await res2.text()).toBe('shared')
  })
})
