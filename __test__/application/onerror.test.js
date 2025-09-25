import Hoa from '../../src/application.js'

describe('app.onerror(err, ctx)', () => {
  it('should throw TypeError for non-error values', () => {
    const app = new Hoa()
    expect(() => app.onerror('boom')).toThrow(/non-error thrown/)
  })

  it('should be called for all errors and receive error and context', async () => {
    const app = new Hoa()
    const loggedErrors = []

    app.onerror = (err, ctx) => {
      loggedErrors.push({
        status: err.status,
        message: err.message,
        expose: err.expose,
        pathname: ctx.req.pathname
      })
    }

    app.use(async (ctx) => {
      if (ctx.req.pathname === '/client') {
        ctx.throw(404, 'Not Found')
      } else if (ctx.req.pathname === '/server') {
        ctx.throw(500, 'Server Error')
      }
    })

    await app.fetch(new Request('https://example.com/client'))
    await app.fetch(new Request('https://example.com/server'))

    expect(loggedErrors).toHaveLength(2)
    expect(loggedErrors[0]).toMatchObject({
      status: 404,
      message: 'Not Found',
      expose: true,
      pathname: '/client'
    })
    expect(loggedErrors[1]).toMatchObject({
      status: 500,
      message: 'Server Error',
      expose: false,
      pathname: '/server'
    })
  })

  it('should not log for 404 or exposed errors', async () => {
    const app = new Hoa()
    const original = console.error
    let called = 0
    console.error = () => { called++ }

    app.use(async (ctx) => {
      if (ctx.req.pathname.includes('404')) {
        ctx.throw(404, 'Not Found')
      } else if (ctx.req.pathname.includes('400')) {
        ctx.throw(400, 'Bad Request')
      } else {
        ctx.throw(500)
      }
    })

    await app.fetch(new Request('https://example.com/404'))
    expect(called).toBe(0)
    await app.fetch(new Request('https://example.com/400'))
    expect(called).toBe(0)
    await app.fetch(new Request('https://example.com/500'))
    expect(called).toBe(1)

    console.error = original
  })

  it('should not log when app.silent is true', async () => {
    const app = new Hoa()
    app.silent = true
    const original = console.error
    let called = 0
    console.error = () => { called++ }

    app.use(async () => { throw new Error('boom') })

    await app.fetch(new Request('https://example.com/'))
    expect(called).toBe(0)

    console.error = original
  })

  it('should log non-404/exposed errors when not silent', async () => {
    const app = new Hoa()
    const original = console.error
    let called = 0
    console.error = () => { called++ }

    app.use(async () => { throw new Error('server error') })

    await app.fetch(new Request('https://example.com/'))
    expect(called).toBe(1)

    console.error = original
  })

  it('should use err.stack when available', () => {
    const app = new Hoa()
    const original = console.error
    let payload = ''
    console.error = (msg) => { payload = msg }

    const err = new Error('no-stack-error')
    err.stack = 'stack trace'

    app.onerror(err)

    expect(payload).toContain('stack trace')

    console.error = original
  })

  it('should use err.toString() when err.stack is missing', () => {
    const app = new Hoa()
    const original = console.error
    let payload = ''
    console.error = (msg) => { payload = msg }

    const err = new Error('no-stack-error')
    err.stack = undefined

    app.onerror(err)

    expect(payload).toContain('Error: no-stack-error')

    console.error = original
  })
})
