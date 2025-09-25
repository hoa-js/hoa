import { statusTextMapping } from './utils.js'

/**
 * @typedef {Object} HttpErrorOptions
 * @property {string} [message] - Custom error message
 * @property {Error} [cause] - The underlying cause of this error
 * @property {boolean} [expose] - Whether to expose the error message to clients (defaults based on status)
 * @property {HeadersInit} [headers] - Additional response headers
 */

export default class HttpError extends Error {
  /**
   * Create a new HttpError instance.
   *
   * @param {number} status - HTTP status code (400-599, invalid codes become 500)
   * @param {string|HttpErrorOptions} [message] - Error message or options object
   * @param {HttpErrorOptions} [options] - Additional options when second param is string
   * @throws {TypeError} When status is not an integer
   */
  constructor (status, message, options) {
    if (!Number.isInteger(status)) {
      throw new TypeError('status code must be an integer')
    }

    if (status < 400 || status >= 600) {
      status = 500
    }

    let finalOptions = {}
    if (typeof message === 'string') {
      finalOptions.message = message
      if (options && typeof options === 'object') {
        finalOptions = { ...finalOptions, ...options }
      }
    } else if (message && typeof message === 'object') {
      finalOptions = message
    }

    // Determine error message
    message = finalOptions.message ?? statusTextMapping[status] ?? 'Unknown error'
    super(message, { cause: finalOptions.cause })

    this.name = 'HttpError'
    this.status = this.statusCode = status
    this.expose = finalOptions.expose ?? (status < 500)

    if (finalOptions.headers) {
      this.headers = Object.fromEntries(new Headers(finalOptions.headers).entries())
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError)
    }
  }
}
