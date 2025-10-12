import { parseSearchParamsToQuery, stringifyQueryToString } from './lib/utils.js'

/**
 * @typedef {Object} ReqJSON
 * @property {string} method - Request method
 * @property {string} url - Request url
 * @property {Record<string, string|string[]>} headers - Request headers
 */

/**
 * @class HoaRequest
 */
export default class HoaRequest {
  /**
   * Parsed URL object of the incoming request.
   * This property provides access to all URL components and is lazily initialized.
   *
   * @returns {URL} The parsed URL object with all URL components
   * @public
   */
  get url () {
    return this._url || (this._url = new URL(this.ctx.request.url))
  }

  /**
   * Overwrite the request URL using a string or URL instance.
   * This allows for URL manipulation and rewriting within middleware.
   *
   * @param {string|URL} val - The new URL as a string or URL object
   * @public
   */
  set url (val) {
    if (typeof val === 'string') {
      val = new URL(val)
    }
    this._url = val
  }

  /**
   * Full request URL string including protocol, host, path, query, and hash.
   *
   * @returns {string} The complete URL as a string
   * @public
   */
  get href () {
    return this.url.href
  }

  /**
   * Replace the full href (origin + path + search + hash).
   * This is a convenience method for completely changing the URL.
   *
   * @param {string} val - The new complete URL string
   * @public
   */
  set href (val) {
    this.url.href = val
  }

  /**
   * Origin portion of the URL (scheme + host + port).
   *
   * @returns {string} The origin (e.g., 'https://example.com:8443')
   * @public
   */
  get origin () {
    return this.url.origin
  }

  /**
   * Replace origin while keeping path, search, and hash components.
   * Useful for proxying requests to different hosts.
   *
   * @param {string} val - The new origin (protocol + host + port)
   * @public
   */
  set origin (val) {
    const { pathname, search, hash } = this.url
    this.url = `${val}${pathname}${search}${hash}`
  }

  /**
   * URL protocol including the trailing colon (e.g., 'https:').
   *
   * @returns {string} The protocol with colon
   * @public
   */
  get protocol () {
    return this.url.protocol
  }

  /**
   * Set the URL protocol.
   *
   * @param {string} val - The new protocol (should include colon)
   * @public
   */
  set protocol (val) {
    this.url.protocol = val
  }

  /**
   * Host with port (if present), e.g., 'example.com:8443'.
   *
   * @returns {string} The host including port if non-standard
   * @public
   */
  get host () {
    return this.url.host
  }

  /**
   * Set host (may include port).
   *
   * @param {string} val - The new host, optionally with port
   * @public
   */
  set host (val) {
    this.url.host = val
  }

  /**
   * Hostname without port, e.g., 'example.com'.
   *
   * @returns {string} The hostname without port
   * @public
   */
  get hostname () {
    const hostname = this.url.hostname
    if (hostname && hostname.startsWith('[') && hostname.endsWith(']')) {
      return hostname.slice(1, -1)
    }
    return hostname
  }

  /**
   * Set hostname (without port).
   *
   * @param {string} val - The new hostname
   * @public
   */
  set hostname (val) {
    this.url.hostname = val
  }

  /**
   * Port string, e.g., '443'. Empty string if using default port.
   *
   * @returns {string} The port number as a string, or empty string for default ports
   * @public
   */
  get port () {
    return this.url.port
  }

  /**
   * Set port string.
   *
   * @param {string} val - The new port number as a string
   * @public
   */
  set port (val) {
    this.url.port = val
  }

  /**
   * Pathname starting with '/', e.g., '/users/1'.
   *
   * @returns {string} The URL pathname
   * @public
   */
  get pathname () {
    return this.url.pathname
  }

  /**
   * Set pathname.
   *
   * @param {string} val - The new pathname (should start with '/')
   * @public
   */
  set pathname (val) {
    this.url.pathname = val
  }

  /**
   * Raw search string including '?', or empty string if no query parameters.
   *
   * @returns {string} The search string with leading '?' or empty string
   * @public
   */
  get search () {
    return this.url.search
  }

  /**
   * Set raw search string (should begin with '?').
   * This invalidates the cached query object.
   *
   * @param {string} val - The new search string
   * @public
   */
  set search (val) {
    this.url.search = val.startsWith('?') ? val : (val ? `?${val}` : '')
    this._query = null
  }

  /**
   * Hash fragment including '#', or empty string if no hash.
   *
   * @returns {string} The hash fragment with leading '#' or empty string
   * @public
   */
  get hash () {
    return this.url.hash
  }

  /**
   * Set hash fragment including '#'.
   *
   * @param {string} val - The new hash fragment
   * @public
   */
  set hash (val) {
    this.url.hash = val || ''
  }

  /**
   * HTTP method (typically upper-case in most runtimes).
   *
   * @returns {string} The HTTP method (GET, POST, PUT, DELETE, etc.)
   * @public
   */
  get method () {
    return this._method || (this._method = this.ctx.request.method)
  }

  /**
   * Override request method (useful for method override middlewares).
   * This allows changing the perceived HTTP method for routing purposes.
   *
   * @param {string} val - The new HTTP method
   * @public
   */
  set method (val) {
    this._method = val
  }

  /**
   * Parsed query object where duplicate keys become arrays.
   * This provides a convenient way to access URL query parameters.
   *
   * @returns {Record<string, string|string[]>} Object with query parameters
   * @public
   */
  get query () {
    return this._query || (this._query = parseSearchParamsToQuery(this.url.searchParams))
  }

  /**
   * Replace query parameters with a plain object.
   * Arrays are serialized with repeated keys.
   *
   * @param {Record<string, string|string[]>} val - New query parameters
   * @public
   */
  set query (val) {
    this.search = stringifyQueryToString(val)
    this._query = null
  }

  /**
   * Expose a plain object snapshot of request headers.
   * Uses the Web Standard Headers API internally for proper header handling.
   * Returns a plain object representation where header names are normalized.
   *
   * @returns {Record<string, string>} Object with all request headers
   * @public
   */
  get headers () {
    this._headers = this._headers || new Headers(this.ctx.request.headers)
    return Object.fromEntries(this._headers.entries())
  }

  /**
   * Set the request headers.
   * Accepts either a Headers object or a plain object/array of header entries.
   * This replaces all existing headers with the new ones.
   *
   * @param {Headers|Record<string, string>|Array<[string, string]>} val - Headers to set
   * @public
   */
  set headers (val) {
    if (val instanceof Headers) {
      this._headers = val
    } else {
      this._headers = new Headers(val)
    }
  }

  /**
   * Get the request body stream.
   * Returns the underlying ReadableStream from the Web Standard Request.
   * This provides direct access to the request body for custom processing.
   *
   * @returns {ReadableStream|null} The request body stream, or null if not available
   * @public
   */
  get body () {
    return this._body || (this._body = this.ctx.request.body)
  }

  /**
   * Set a custom request body stream.
   * This allows middleware to replace the request body with a custom stream.
   *
   * @param {any} val - The new request body
   * @public
   */
  set body (val) {
    this._body = val
  }

  /**
   * Get a request header value by name (case-insensitive).
   * Uses the Web Standard Headers API for proper header retrieval.
   * Special-cases "referer/referrer" for compatibility.
   *
   * @param {string} field - The header name
   * @returns {string|null} The header value or null if not found
   * @public
   */
  get (field) {
    if (!field) return null
    this._headers = this._headers || new Headers(this.ctx.request.headers)
    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return this._headers.get('referrer') ?? this._headers.get('referer')
      default:
        return this._headers.get(field)
    }
  }

  /**
   * Get all Set-Cookie header values as an array.
   * Returns all Set-Cookie headers from the request (useful for proxying).
   *
   * @returns {string[]} Array of Set-Cookie header values
   * @public
   */
  getSetCookie () {
    this._headers = this._headers || new Headers(this.ctx.request.headers)
    return this._headers.getSetCookie()
  }

  /**
   * Check if a request header is present.
   * Uses the Web Standard Headers API for case-insensitive header checking.
   *
   * @param {string} field - The header name to check
   * @returns {boolean} True if the header exists
   * @public
   */
  has (field) {
    if (!field) return false
    this._headers = this._headers || new Headers(this.ctx.request.headers)
    return this._headers.has(field)
  }

  /**
   * Set request header(s) using the Web Standard Headers API.
   * Accepts various input formats:
   * - Single key/value pair
   * - Plain object with multiple headers
   * Replaces existing header values.
   *
   * @param {string|Record<string,string>} field - Header name or headers object
   * @param {string} [val] - Header value when field is a string
   * @public
   */
  set (field, val) {
    if (!field) return
    this._headers = this._headers || new Headers(this.ctx.request.headers)

    if (typeof field === 'string') {
      this._headers.set(field, val)
    } else {
      Object.keys(field).forEach(header => this._headers.set(header, field[header]))
    }
  }

  /**
   * Append a request header value using the Web Standard Headers API.
   * Does not replace existing values, but appends to them.
   * This is useful for headers that can have multiple values.
   *
   * @param {string|Record<string,string>} field - The header name or headers object
   * @param {string} [val] - The value to append when field is a string
   * @public
   */
  append (field, val) {
    if (!field) return
    this._headers = this._headers || new Headers(this.ctx.request.headers)

    if (typeof field === 'string') {
      this._headers.append(field, val)
    } else {
      Object.keys(field).forEach(header => this._headers.append(header, field[header]))
    }
  }

  /**
   * Delete a request header by name using the Web Standard Headers API.
   * Header deletion is case-insensitive.
   *
   * @param {string} field - The header name to delete
   * @public
   */
  delete (field) {
    if (!field) return
    this._headers = this._headers || new Headers(this.ctx.request.headers)
    this._headers.delete(field)
  }

  /**
   * Get the client IP addresses from the X-Forwarded-For header.
   * Returns an array of IP addresses in order from client to proxy.
   * If X-Forwarded-For is not available, returns array with single IP from get ip().
   *
   * @returns {string[]} Array of IP addresses, or array with single IP if X-Forwarded-For not found
   * @public
   */
  get ips () {
    const xForwardedFor = this.get('x-forwarded-for')
    if (!xForwardedFor) {
      const singleIp = this.ip
      return singleIp ? [singleIp] : []
    }
    return xForwardedFor.split(',').map(ip => ip.trim()).filter(ip => ip)
  }

  /**
   * Get the client IP address by checking various headers in order of precedence.
   * Based on the request-ip library implementation logic.
   *
   * @returns {string} The client IP address, or empty string if none found
   * @public
   */
  get ip () {
    // Headers to check in order of precedence (based on request-ip library)
    const headers = [
      'x-client-ip',
      'x-forwarded-for',
      'cf-connecting-ip',
      'do-connecting-ip',
      'fastly-client-ip',
      'true-client-ip',
      'x-real-ip',
      'x-cluster-client-ip',
      'x-forwarded',
      'forwarded-for',
      'forwarded',
      'x-appengine-user-ip',
      'cf-pseudo-ipv4'
    ]

    for (const header of headers) {
      const value = this.get(header)
      if (value) {
        // For X-Forwarded-For and similar headers that may contain multiple IPs,
        // take the first one (client IP)
        if (header === 'x-forwarded-for' || header === 'forwarded-for') {
          const firstIp = value.split(',')[0]?.trim()
          if (firstIp) {
            return firstIp
          }
        } else {
          return value
        }
      }
    }

    return ''
  }

  /**
   * Get the request content length from the Content-Length header.
   * Returns undefined if the header is missing, empty, or not a valid number.
   *
   * @returns {number|null} The content length in bytes, or null if not available
   * @public
   */
  get length () {
    const len = this.get('Content-Length')
    if (len == null) return null
    return ~~len
  }

  /**
   * Get the request content type from the Content-Type header.
   * Returns only the media type without parameters (e.g., 'application/json').
   *
   * @returns {string|null} The content type, or null if not set
   * @public
   */
  get type () {
    const type = this.get('Content-Type')
    if (!type) return null
    return type.split(';', 1)[0].trim().toLowerCase()
  }

  /**
   * Read request body as a Blob.
   * This method can only be called once per request.
   *
   * @returns {Promise<Blob>} The request body as a Blob
   * @public
   */
  async blob () {
    return this.ctx.request.blob()
  }

  /**
   * Read request body as an ArrayBuffer.
   * This method can only be called once per request.
   *
   * @returns {Promise<ArrayBuffer>} The request body as an ArrayBuffer
   * @public
   */
  async arrayBuffer () {
    return this.ctx.request.arrayBuffer()
  }

  /**
   * Read request body as text.
   * This reads the Web Standard Request body stream. Platforms typically allow
   * reading the underlying stream only once; calling multiple different readers
   * (e.g., text() then blob()) is invalid.
   *
   * @returns {Promise<string>} The request body as a string
   * @public
   */
  async text () {
    return this.ctx.request.text()
  }

  /**
   * Read request body as JSON.
   * This method can only be called once per request.
   *
   * @returns {Promise<any>} The parsed JSON data
   * @throws {SyntaxError}
   * @public
   */
  async json () {
    const text = await this.text()
    return JSON.parse(text)
  }

  /**
   * Read request body as FormData.
   * This method can only be called once per request.
   *
   * @returns {Promise<FormData>} The request body as FormData
   * @public
   */
  async formData () {
    return this.ctx.request.formData()
  }

  /**
   * Return JSON representation of the request.
   *
   * @returns {ReqJSON} JSON representation of request
   * @public
   */
  toJSON () {
    return {
      method: this.method,
      url: this.href,
      headers: this.headers
    }
  }
}
