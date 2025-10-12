import Hoa from '../../src/hoa.js'

describe('ctx.throw(status, message)', () => {
  it('should throw with status code only', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    expect(() => {
      ctx.throw(400)
    }).toThrow(expect.objectContaining({
      status: 400,
      message: 'Bad Request',
      expose: true
    }))

    expect(() => ctx.throw(404)).toThrow(expect.objectContaining({ expose: true }))
    expect(() => ctx.throw(500)).toThrow(expect.objectContaining({ expose: false }))
  })

  it('should throw with status and message', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    expect(() => {
      ctx.throw(400, 'name required')
    }).toThrow(expect.objectContaining({
      status: 400,
      message: 'name required',
      expose: true
    }))

    expect(() => {
      ctx.throw(500, 'boom')
    }).toThrow(expect.objectContaining({
      status: 500,
      message: 'boom',
      expose: false
    }))
  })

  it('should throw with status and options object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const cause = new Error('underlying error')

    expect(() => {
      ctx.throw(500, {
        message: 'Server Error',
        expose: true, // Override default false for 5xx
        cause,
        headers: { 'X-Foo': 'foo' }
      })
    }).toThrow(expect.objectContaining({
      status: 500,
      message: 'Server Error',
      expose: true,
      cause,
      headers: { 'x-foo': 'foo' }
    }))

    expect(() => {
      ctx.throw(422, { message: 'validation failed', cause })
    }).toThrow(expect.objectContaining({
      message: 'validation failed',
      status: 422,
      expose: true,
      cause
    }))
  })

  it('should throw with status, message and options', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const cause = new Error('root cause')

    expect(() => {
      ctx.throw(400, 'Custom message', {
        message: 'Overridden message',
        expose: false,
        cause,
        headers: new Headers([['Content-Type', 'application/json']])
      })
    }).toThrow(expect.objectContaining({
      status: 400,
      message: 'Overridden message',
      expose: false,
      cause,
      headers: { 'content-type': 'application/json' }
    }))
  })

  it('should handle invalid status codes', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    expect(() => ctx.throw(200)).toThrow(expect.objectContaining({ status: 500 }))
    expect(() => ctx.throw(700)).toThrow(expect.objectContaining({ status: 500 }))

    expect(() => ctx.throw(200.5)).toThrow(/integer/)
    expect(() => ctx.throw('500')).toThrow(/integer/)
  })

  it('should handle unmapped status codes', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    expect(() => ctx.throw(499)).toThrow(expect.objectContaining({
      status: 499,
      message: 'Unknown error',
      expose: true
    }))

    expect(() => ctx.throw(599)).toThrow(expect.objectContaining({
      status: 599,
      message: 'Unknown error',
      expose: false
    }))
  })

  it('should handle headers in different formats', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    expect(() => {
      ctx.throw(400, {
        message: 'Bad Request',
        headers: new Headers([['X-Foo', 'foo']])
      })
    }).toThrow(expect.objectContaining({
      headers: { 'x-foo': 'foo' }
    }))

    expect(() => {
      ctx.throw(400, {
        message: 'Bad Request',
        headers: { 'X-Request-ID': '123', 'Content-Type': 'application/json' }
      })
    }).toThrow(expect.objectContaining({
      headers: { 'x-request-id': '123', 'content-type': 'application/json' }
    }))
  })

  it('should preserve error properties and stack trace', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    try {
      ctx.throw(400, 'test error')
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err.name).toBe('HttpError')
      expect(err.stack).toBeDefined()
      expect(typeof err.stack).toBe('string')
      expect(err.stack).toContain('HttpError')
    }
  })
})
