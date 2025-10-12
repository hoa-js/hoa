import HttpError from './lib/http-error.js'
import { statusTextMapping } from './lib/utils.js'

/**
 * @typedef {Object} CtxJSON
 * @property {ReturnType<import('./hoa.js').default.prototype.toJSON>} app
 * @property {ReturnType<import('./request.js').default.prototype.toJSON>} req
 * @property {ReturnType<import('./response.js').default.prototype.toJSON>} res
 */

/**
 * @class HoaContext
 */
export default class HoaContext {
  /**
   * Create a context for a single HTTP request.
   *
   * @param {Object} [options={}]
   * @param {Request} [options.request] - Web Standard Request
   * @param {any} [options.env] - Environment (platform-specific)
   * @param {any} [options.executionCtx] - Execution context (platform-specific)
   * @public
   */
  constructor (options = {}) {
    this.request = options.request
    this.env = options.env
    this.executionCtx = options.executionCtx
    this.state = Object.create(null)
  }

  /**
   * Throw an HttpError.
   *
   * @param {number} status - HTTP status code
   * @param {string|{message?: string, cause?: any, headers?: HeadersInit}} [messageOrOptions] - Error message or options object
   * @throws {HttpError}
   * @public
   */
  throw (...args) {
    throw new HttpError(...args)
  }

  /**
   * Assert condition or throw an HttpError.
   *
   * @param {any} value - Condition to assert
   * @param {...any} args - Arguments passed to HttpError constructor
   * @throws {HttpError}
   * @public
   */
  assert (value, ...args) {
    if (value) return
    throw new HttpError(...args)
  }

  /**
   * Default error handling and response builder.
   *
   * @param {Error} err - Error to handle
   * @returns {Response} Web Standard Response object
   * @private
   */
  onerror (err) {
    const { res } = this

    // Cross-realm Error check; see koa#1466 and jest#2549
    const isNativeError =
      Object.prototype.toString.call(err) === '[object Error]' ||
      err instanceof Error
    if (!isNativeError) err = new Error(`non-error thrown: ${JSON.stringify(err)}`)

    this.app.onerror(err, this)

    // Reset headers to prevent conflicts
    res.headers = new Headers()

    // Apply error headers if provided
    res.set(err.headers)

    // Force text/plain content type
    res.type = 'text'

    let status = err.status || err.statusCode
    if (typeof status !== 'number' || !statusTextMapping[status]) status = 500

    const message = statusTextMapping[status]
    const msg = err.expose ? err.message : message
    res.status = status
    res.body = msg

    return new Response(res.body, {
      status: res.status,
      headers: res._headers
    })
  }

  /**
   * Return JSON representation of the context.
   *
   * @returns {CtxJSON} JSON representation of context
   * @public
   */
  toJSON () {
    return {
      app: this.app.toJSON(),
      req: this.req.toJSON(),
      res: this.res.toJSON()
    }
  }
}
