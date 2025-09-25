import Hoa from '../../src/application.js'

describe('app.fetch(request, env, ctx)', () => {
  it('should compose once and reuse cached middleware on subsequent fetch calls', async () => {
    const app = new Hoa()

    const calls = []
    app.use(async (ctx, next) => {
      calls.push('1')
      await next()
      calls.push('2')
    })

    app.use(async (ctx) => {
      calls.push('3')
      ctx.res.body = 'Hello, Hoa!'
      calls.push('4')
    })

    expect(calls).toEqual([])
    expect(app.middlewares.length).toBe(2)
    expect(app._composedMiddleware).toBeNull()

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello, Hoa!')
    expect(calls).toEqual(['1', '3', '4', '2'])
    expect(app.middlewares.length).toBe(2)
    expect(app._composedMiddleware).toBeDefined()
  })
})
