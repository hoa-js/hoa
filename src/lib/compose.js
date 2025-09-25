/**
 * Compose middleware functions into a single dispatcher.
 *
 * @param {Function[]} middlewares
 * @returns {Function}
 * @private
 */
const composeSlim = (middlewares) => async (ctx, next) => {
  /**
   * Creates a dispatch function for the middleware at index i.
   * Each dispatch function calls the next middleware in the chain.
   *
   * @param {number} i - Index of the current middleware
   * @returns {Function} Async function that executes the middleware
   */
  const dispatch = (i) => async () => {
    const fn = i === middlewares.length
      ? next
      : middlewares[i]
    if (!fn) return
    return await fn(ctx, dispatch(i + 1))
  }
  return dispatch(0)()
}

/**
 * @callback Middleware
 * @param {any} ctx
 * @param {Function} next
 * @returns {Promise<any>|any}
 */

/**
 * Compose multiple middleware functions into one.
 * Validates input, flattens nested arrays, and returns a composed dispatcher.
 *
 * @param {Middleware[]|Middleware[][]} middlewares
 * @returns {(ctx: HoaContext) => Promise<void>}
 * @throws {TypeError}
 * @public
 */
export default function compose (middlewares) {
  // Enforce array-only API
  if (!Array.isArray(middlewares)) {
    throw new TypeError('compose() must receive an array of middleware functions!')
  }

  // Flatten nested arrays
  middlewares = middlewares.flat()

  // Validate that all middlewares are functions
  for (const middleware of middlewares) {
    if (typeof middleware !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return composeSlim(middlewares)
}
