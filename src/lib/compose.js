/**
 * Compose middleware functions into a single dispatcher.
 *
 * @param {HoaMiddleware[]} middlewares - Array of middleware functions
 * @returns {HoaMiddleware} Composed middleware function
 * @private
 */
const composeSlim = (middlewares) => async (ctx, next) => {
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
 * Compose multiple middleware functions into one.
 * Validates input, flattens nested arrays, and returns a composed dispatcher.
 *
 * @param {HoaMiddleware[]|HoaMiddleware[][]} middlewares - Array of middleware functions or nested arrays
 * @returns {HoaMiddleware} Composed middleware function
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
