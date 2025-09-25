import HttpError from '../../src/lib/http-error.js'

describe('HttpError', () => {
  it('should support all HttpErrorOptions parameters', () => {
    const err1 = new HttpError(400)
    expect(err1).toMatchObject({ status: 400, message: 'Bad Request', expose: true })
    expect(err1.headers).toBeUndefined()
    expect(err1.cause).toBeUndefined()

    const err2 = new HttpError(400, 'Custom message')
    expect(err2).toMatchObject({ status: 400, message: 'Custom message', expose: true })
    expect(err2.headers).toBeUndefined()
    expect(err2.cause).toBeUndefined()

    const cause = new Error('Root cause')
    const err3 = new HttpError(500, {
      message: 'Server Error',
      expose: true,
      cause,
      headers: { 'X-Foo': 'foo' }
    })
    expect(err3).toMatchObject({
      status: 500,
      message: 'Server Error',
      expose: true,
      cause,
      headers: { 'x-foo': 'foo' }
    })

    const err4 = new HttpError(400, 'Custom message', {
      message: 'Overridden message',
      expose: false,
      cause,
      headers: new Headers([['Content-Type', 'application/json']])
    })
    expect(err4).toMatchObject({
      status: 400,
      message: 'Overridden message',
      expose: false,
      cause,
      headers: { 'content-type': 'application/json' }
    })

    expect(new HttpError(404).expose).toBe(true)
    expect(new HttpError(500).expose).toBe(false)
    expect(new HttpError(400, { expose: false }).expose).toBe(false)
  })

  it('should handle invalid or unmapped status codes', () => {
    expect(new HttpError(200).status).toBe(500)
    expect(new HttpError(700).status).toBe(500)

    expect(() => new HttpError(200.5)).toThrow(/integer/)
    expect(() => new HttpError('500')).toThrow(/integer/)

    const unmapped499Err = new HttpError(499)
    expect(unmapped499Err).toMatchObject({ status: 499, message: 'Unknown error', expose: true })
    const unmapped599Err = new HttpError(599)
    expect(unmapped599Err).toMatchObject({ status: 599, message: 'Unknown error', expose: false })
  })

  it('should work when Error.captureStackTrace is unavailable', () => {
    const originalCapture = Error.captureStackTrace
    Error.captureStackTrace = undefined

    try {
      const err = new HttpError(400)
      expect(err).toBeInstanceOf(Error)
      expect(err.status).toBe(400)
    } finally {
      Error.captureStackTrace = originalCapture
    }
  })

  it('should be properly exported and throwable', () => {
    expect(HttpError).toBeDefined()
    expect(() => { throw new HttpError(400, 'test') }).toThrow(HttpError)
  })
})
