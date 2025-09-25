import compose from '../../src/lib/compose.js'

describe('compose([fn])', () => {
  it('should execute middleware in onion order', async () => {
    const calls = []
    const middleware = [
      async (ctx, next) => {
        calls.push('1')
        await next()
        calls.push('2')
      },
      async (ctx, next) => {
        calls.push('3')
        await next()
        calls.push('4')
      },
      async () => {
        calls.push('5')
      }
    ]

    const fn = compose(middleware)
    await fn({}, async () => calls.push('Hello, Hoa!'))

    expect(calls).toEqual(['1', '3', '5', '4', '2'])
  })

  it('should propagate the provided next function', async () => {
    const calls = []
    const middleware = [
      async (ctx, next) => {
        calls.push('1')
        await next()
        calls.push('2')
      },
      async (ctx, next) => {
        calls.push('3')
        await next()
        calls.push('4')
      }
    ]

    const fn = compose(middleware)
    await fn({}, async () => calls.push('Hello, Hoa!'))

    expect(calls).toEqual(['1', '3', 'Hello, Hoa!', '4', '2'])
  })

  it('should throw an error for invalid middleware', () => {
    expect(() => compose(null)).toThrow(/compose\(\) must receive an array of middleware functions/i)
    expect(() => compose(undefined)).toThrow(/compose\(\) must receive an array of middleware functions/i)
    expect(() => compose('not-array')).toThrow(/compose\(\) must receive an array of middleware functions/i)
    expect(() => compose(123)).toThrow(/compose\(\) must receive an array of middleware functions/i)

    expect(() => compose([() => {}, {}])).toThrow(/Middleware must be composed of functions/i)
    expect(() => compose([null])).toThrow(/Middleware must be composed of functions/i)
    expect(() => compose(['not-function'])).toThrow(/Middleware must be composed of functions/i)
  })
})
