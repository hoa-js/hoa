import compose from './lib/compose.js'
import HttpError from './lib/http-error.js'
import { statusEmptyMapping } from './lib/utils.js'
import HoaContext from './context.js'
import HoaRequest from './request.js'
import HoaResponse from './response.js'

/**
 * @typedef {Object} AppJSON
 * @property {string} name - Application name
 */

/**
 * @class Hoa
 * @property {string} name - Application name
 * @property {boolean} [silent] - Suppress error console output when true
 */
export default class Hoa {
  /**
   * Create an Hoa instance.
   *
   * @param {Object} [options={}] - Application options
   * @param {string} [options.name='Hoa'] - Application name for identification
   */
  constructor (options = {}) {
    this.name = options.name || 'Hoa'
    this.HoaContext = HoaContext
    this.HoaRequest = HoaRequest
    this.HoaResponse = HoaResponse
    this.middlewares = []
    this.fetch = this.fetch.bind(this)
  }

  /**
   * Extend the application with a plugin initializer.
   *
   * @param {HoaExtension} fn - Plugin function that receives the app instance
   * @returns {Hoa} The Hoa instance for method chaining
   * @throws {TypeError}
   * @public
   */
  extend (fn) {
    if (typeof fn !== 'function') { throw new TypeError('extend() must receive a function!') }
    fn(this)
    return this
  }

  /**
   * Register a middleware. Executed in registration order.
   *
   * @param {HoaMiddleware} fn - Middleware function
   * @returns {Hoa} The Hoa instance for method chaining
   * @throws {TypeError}
   * @public
   */
  use (fn) {
    if (typeof fn !== 'function') { throw new TypeError('use() must receive a function!') }
    this.middlewares.push(fn)
    this._composedMiddleware = null
    return this
  }

  /**
   * Web Standards fetch handler - main entry point for HTTP requests.
   * Compatible with Cloudflare Workers, Deno, and other Web Standards environments.
   *
   * @param {Request} request - Web Standard Request object
   * @param {any} [env] - Environment variables (platform-specific)
   * @param {any} [executionCtx] - Execution context (platform-specific)
   * @returns {Promise<Response>} Web Standard Response object
   * @public
   */
  fetch (request, env, executionCtx) {
    const ctx = this.createContext(request, env, executionCtx)
    if (!this._composedMiddleware) this._composedMiddleware = compose(this.middlewares)

    return this.handleRequest(ctx, this._composedMiddleware)
  }

  /**
   * Handle incoming request through the middleware stack.
   * Manages error handling and response building.
   *
   * @param {HoaContext} ctx - Request context
   * @param {HoaMiddleware} middlewareFn - Composed middleware function
   * @returns {Promise<Response>} Web Standard Response object
   * @private
   */
  handleRequest (ctx, middlewareFn) {
    const onerror = (err) => ctx.onerror(err)
    const handleResponse = () => respond(ctx)

    return middlewareFn(ctx).then(handleResponse).catch(onerror)
  }

  /**
   * Create context for incoming request with linked request/response objects.
   * Establishes the context chain: ctx ↔ req ↔ res ↔ app
   *
   * @param {Request} request - Web Standard Request object
   * @param {any} [env] - Environment variables
   * @param {any} [executionCtx] - Execution context
   * @returns {HoaContext} Created context instance
   * @private
   */
  createContext (request, env, executionCtx) {
    const ctx = new this.HoaContext({ request, env, executionCtx })
    const req = ctx.req = new this.HoaRequest()
    const res = ctx.res = new this.HoaResponse()
    ctx.app = req.app = res.app = this
    req.ctx = res.ctx = ctx
    req.res = res
    res.req = req
    return ctx
  }

  /**
   * Default error handler for unhandled application errors.
   * Logs errors to console unless they're client errors (4xx) or explicitly exposed.
   *
   * @param {Error} err - Error to handle
   * @param {HoaContext} [ctx] - Request context (optional)
   * @returns {void}
   * @throws {TypeError}
   * @private
   */
  onerror (err, ctx) {
    const isNativeError =
      Object.prototype.toString.call(err) === '[object Error]' ||
      err instanceof Error
    if (!isNativeError) { throw new TypeError(`non-error thrown: ${JSON.stringify(err)}`) }

    if (err.status === 404 || err.expose) return
    if (this.silent) return

    const msg = err.stack || err.toString()
    console.error(`\n${msg.replace(/^/gm, '  ')}\n`)
  }

  /**
   * ESM/CJS interop helper for default exports.
   *
   * @returns {typeof Hoa} The Hoa class
   * @static
   */
  static get default () {
    return Hoa
  }

  /**
   * Return JSON representation of the app.
   *
   * @returns {AppJSON} JSON representation of application
   * @public
   */
  toJSON () {
    return {
      name: this.name
    }
  }
}

/**
 * Build Web Standard Response from context state.
 * Handles various body types, HEAD requests, and status-specific behaviors.
 *
 * @param {HoaContext} ctx - Request context with response state
 * @returns {Response} Web Standard Response object
 * @private
 */
function respond (ctx) {
  const { res, req } = ctx
  let body = res.body

  // ignore body for HEAD requests
  if (req.method === 'HEAD') {
    if (!res.has('Content-Length')) {
      const contentLength = res.length
      if (Number.isInteger(contentLength)) {
        res.length = contentLength
      }
    }

    return new Response(null, {
      status: res.status,
      statusText: res.statusText,
      headers: res._headers
    })
  }

  // ignore body
  if (statusEmptyMapping[res.status]) {
    // strip headers
    res.body = null
    return new Response(null, {
      status: res.status,
      statusText: res.statusText,
      headers: res._headers
    })
  }

  // status no body
  if (body == null) {
    if (res._explicitNullBody) {
      res.delete('Content-Type')
      res.delete('Transfer-Encoding')
      res.set('Content-Length', '0')
    }
    return new Response(null, {
      status: res.status,
      statusText: res.statusText,
      headers: res._headers
    })
  }

  // String|Blob|ArrayBuffer|TypedArray|ReadableStream|FormData|URLSearchParams
  if (
    (typeof body === 'string') ||
    (body instanceof Blob) ||
    (body instanceof ArrayBuffer) ||
    ArrayBuffer.isView(body) ||
    (body instanceof ReadableStream) ||
    (body instanceof FormData) ||
    (body instanceof URLSearchParams)
  ) {
    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: res._headers
    })
  }

  // Response
  if (body instanceof Response) {
    return new Response(body.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res._headers
    })
  }

  // json
  body = JSON.stringify(body)
  return new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res._headers
  })
}

export { Hoa, HoaContext, HoaRequest, HoaResponse, HttpError, compose }
