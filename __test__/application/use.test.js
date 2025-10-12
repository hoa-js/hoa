import Hoa from '../../src/hoa.js'

describe('app.use(fn)', () => {
  it('should compose middleware', async () => {
    const app = new Hoa()
    const calls = []

    app.use(async (ctx, next) => {
      calls.push(1)
      await next()
      calls.push(2)
    })

    app.use(async (ctx, next) => {
      calls.push(3)
      await next()
      calls.push(4)
    })

    app.use(async (ctx, next) => {
      calls.push(5)
      await next()
      calls.push(6)
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(404)
    expect(calls).toEqual([1, 3, 5, 6, 4, 2])
  })

  it('should compose mixed async/sync middleware', async () => {
    const app = new Hoa()
    const calls = []

    app.use((ctx, next) => {
      calls.push(1)
      return next().then(() => {
        calls.push(2)
      })
    })

    app.use(async (ctx, next) => {
      calls.push(3)
      await next()
      calls.push(4)
    })

    app.use((ctx, next) => {
      calls.push(5)
      return next().then(() => {
        ctx.res.body = 'Hello, Hoa!'
        calls.push(6)
      })
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello, Hoa!')
    expect(calls).toEqual([1, 3, 5, 6, 4, 2])
  })

  it('should support method chaining', () => {
    const app = new Hoa()
    const result = app.use(() => {}).use(() => {})
    expect(result).toBe(app)
  })

  it('should throw when middleware is not a function', () => {
    const app = new Hoa()
    const invalidValues = [null, undefined, 0, false, 'not a function', {}, []]

    invalidValues.forEach(value => {
      expect(() => app.use(value)).toThrow('use() must receive a function!')
    })
  })

  it('should catch thrown errors in middleware', async () => {
    const app = new Hoa()

    app.use(ctx => ctx.throw(404, 'Not Found'))

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('Not Found')
  })

  it('should handle errors thrown in middleware chain - early error', async () => {
    const app = new Hoa()
    const calls = []

    app.use(async (ctx, next) => {
      calls.push(1)
      await next()
      calls.push(2)
    })

    app.use(async (ctx, next) => {
      calls.push(3)
      await next()
      calls.push(4)
    })

    app.use(async (ctx, next) => {
      ctx.throw(400, 'Bad Request')
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(400)
    expect(calls).toEqual([1, 3])
  })

  it('should handle errors thrown in middleware chain - after next', async () => {
    const app = new Hoa()
    const calls = []

    app.use(async (ctx, next) => {
      calls.push(1)
      await next()
      calls.push(2)
    })

    app.use(async (ctx, next) => {
      calls.push(3)
      await next()
      calls.push(4)
      ctx.throw(400, 'Bad Request')
    })

    app.use(async (ctx, next) => {
      calls.push(5)
      await next()
      calls.push(6)
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(400)
    expect(calls).toEqual([1, 3, 5, 6, 4])
  })
})
