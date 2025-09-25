import { jest, expect } from '@jest/globals'

global.expect = expect

const originalConsoleError = console.error
beforeEach(() => {
  console.error = jest.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

expect.extend({
  toBeHttpError (received, expectedStatus) {
    const pass = received instanceof Error &&
                 received.status === expectedStatus &&
                 typeof received.expose === 'boolean'

    if (pass) {
      return {
        message: () => `expected ${received} not to be an HTTP error with status ${expectedStatus}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be an HTTP error with status ${expectedStatus}`,
        pass: false
      }
    }
  }
})

if (typeof globalThis.Request === 'undefined') {
  console.warn('Web Standards APIs (Request, Response, Headers) should be available')
}
