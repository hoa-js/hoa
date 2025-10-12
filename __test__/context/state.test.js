import Hoa from '../../src/hoa.js'

describe('ctx.state', () => {
  it('should share state between middleware', async () => {
    const app = new Hoa()

    app.use(async (ctx, next) => {
      ctx.state.step = '1'
      await next()
      expect(ctx.state.step).toBe('2')
    })

    app.use(async (ctx) => {
      expect(ctx.state.step).toBe('1')
      ctx.state.step = '2'
      ctx.res.body = 'done'
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('done')
  })
})
