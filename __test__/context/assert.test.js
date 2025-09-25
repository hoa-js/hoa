import Hoa from '../../src/application.js'

describe('ctx.assert(value, status, message)', () => {
  it('should throw an error for falsy values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const falsyValues = [false, 0, '', null, undefined, NaN]

    falsyValues.forEach(value => {
      expect(() => {
        ctx.assert(value, 404, 'custom message')
      }).toThrow(expect.objectContaining({
        status: 404,
        message: 'custom message',
        expose: true
      }))
    })
  })

  it('should not throw for truthy values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const truthyValues = [true, 1, 'string', [], {}, () => {}]

    truthyValues.forEach(value => {
      expect(() => {
        ctx.assert(value, 404, 'should not throw')
      }).not.toThrow()
    })
  })

  it('should use default status and message when not provided', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    try {
      ctx.assert(false, 400)
    } catch (err) {
      expect(err.status).toBe(400)
      expect(err.message).toBe('Bad Request')
    }

    try {
      ctx.assert(false, 500, 'Custom Error')
    } catch (err) {
      expect(err.status).toBe(500)
      expect(err.message).toBe('Custom Error')
    }
  })

  it('should set expose property based on status code', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    try {
      ctx.assert(false, 404)
    } catch (err) {
      expect(err.expose).toBe(true)
    }

    try {
      ctx.assert(false, 500)
    } catch (err) {
      expect(err.expose).toBe(false)
    }
  })
})
