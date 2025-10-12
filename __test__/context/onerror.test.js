import Hoa from '../../src/hoa.js'

describe('ctx.onerror(err)', () => {
  it('should handle errors and reset headers', async () => {
    const app = new Hoa()
    let seenError = false

    app.onerror = (err, { res }) => {
      expect(err.message).toBe('boom')
      seenError = true
    }

    app.use((ctx) => {
      ctx.res.set('Vary', 'Accept-Encoding')
      ctx.res.set('X-CSRF-Token', 'asdf')
      ctx.res.body = 'response'
      ctx.throw(418, 'boom')
    })

    const res = await app.fetch(new Request('https://example.com/'))

    expect(seenError).toBe(true)
    expect(res.status).toBe(418)
    expect(res.headers.get('content-type')).toBe('text/plain;charset=UTF-8')
    expect(res.headers.has('vary')).toBe(false)
    expect(res.headers.has('x-csrf-token')).toBe(false)
  })

  it('should apply headers from HttpError options and clear previous headers', async () => {
    const app = new Hoa()

    app.use((ctx) => {
      ctx.res.set('Vary', 'Accept-Encoding')
      ctx.res.body = 'response'
      ctx.throw(429, { message: 'Too Many Requests', headers: { 'Retry-After': '120' } })
    })

    const res = await app.fetch(new Request('https://example.com/'))

    expect(res.status).toBe(429)
    expect(await res.text()).toBe('Too Many Requests')
    expect(res.headers.get('retry-after')).toBe('120')
    expect(res.headers.get('content-type')).toBe('text/plain;charset=UTF-8')
    expect(res.headers.has('vary')).toBe(false)
  })

  it('should set headers specified in the error object', async () => {
    const app = new Hoa()

    app.use((ctx) => {
      ctx.res.set('Vary', 'Accept-Encoding')
      ctx.res.body = 'response'

      const error = new Error('boom')
      error.status = 418
      error.expose = true
      error.headers = { 'X-Foo': 'foo' }
      throw error
    })

    const res = await app.fetch(new Request('https://example.com/'))

    expect(res.status).toBe(418)
    expect(res.headers.get('x-foo')).toBe('foo')
    expect(res.headers.has('vary')).toBe(false)
  })

  it('should handle non-Error objects thrown', async () => {
    const app = new Hoa()
    let assertionRan = false

    app.onerror = err => {
      expect(err.message).toBe('non-error thrown: "string error"')
      assertionRan = true
    }

    app.use(() => {
      // eslint-disable-next-line no-throw-literal
      throw 'string error'
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal Server Error')
    expect(assertionRan).toBe(true)
  })

  it('should stringify object errors', async () => {
    const app = new Hoa()
    let assertionRan = false

    app.onerror = err => {
      expect(err.message).toBe('non-error thrown: {"key":"value"}')
      assertionRan = true
    }

    app.use(() => {
      // eslint-disable-next-line no-throw-literal
      throw { key: 'value' }
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal Server Error')
    expect(assertionRan).toBe(true)
  })

  it('should handle invalid error status fields', async () => {
    const app = new Hoa()

    app.use((ctx) => {
      const err = new Error('some error')
      err.statusCode = 'notnumber'
      throw err
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal Server Error')
  })

  it('should reset headers when ctx.onerror is called directly', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.res.set('Vary', 'Accept-Encoding')
    ctx.res.set('X-Foo', 'foo')

    const response = ctx.onerror(new Error('error'))

    expect(response.headers.has('vary')).toBe(false)
    expect(response.headers.has('x-foo')).toBe(false)
    expect(response.headers.get('content-type')).toBe('text/plain;charset=UTF-8')
  })

  it('should handle thrown errors and default to 500', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      throw new Error('Test error')
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal Server Error')
  })

  it('should not expose 5xx errors by default', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      ctx.throw(500, 'Internal Error')
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal Server Error')
  })

  it('should handle async errors', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Async error'))
        }, 10)
      })
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal Server Error')
  })

  it('should handle errors in custom error handlers', async () => {
    const app = new Hoa()

    app.use(async (ctx, next) => {
      try {
        await next()
      } catch (err) {
        ctx.res.status = err.status || 500
        ctx.res.body = err.expose ? err.message : 'Error handled'
      }
    })

    app.use(async (ctx) => {
      ctx.throw(502, 'Custom error', { expose: true })
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(502)
    expect(await res.text()).toBe('Custom error')
  })

  it('should handle JSON errors with custom handler', async () => {
    const app = new Hoa()

    app.use(async (ctx, next) => {
      try {
        await next()
      } catch (err) {
        ctx.res.status = err.status || 500
        ctx.res.set('Content-Type', 'application/json')
        ctx.res.body = JSON.stringify({ error: 'API Error' })
      }
    })

    app.use(async (ctx) => {
      ctx.throw(400, 'API Error', { expose: true })
    })

    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(400)
    expect(res.headers.get('content-type')).toBe('application/json')
    expect(await res.json()).toEqual({ error: 'API Error' })
  })
})
