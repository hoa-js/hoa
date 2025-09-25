import { statusTextMapping, statusEmptyMapping, statusRedirectMapping, commonTypeMapping, encodeUrl } from './lib/utils.js'

/**
 * @typedef {Object} ResJSON
 * @property {number} status - Response status code
 * @property {string} statusText - Response status text
 * @property {Record<string, string|string[]>} headers - Response headers
 */

/**
 * @class HoaResponse
 */
export default class HoaResponse {
  /**
   * Expose a plain object snapshot of response headers.
   * Uses the Web Standard Headers API internally for proper header handling.
   * Returns a plain object representation where header names are normalized.
   *
   * @returns {Record<string, string>} Object with all response headers
   * @public
   */
  get headers () {
    this._headers = this._headers || new Headers()
    return Object.fromEntries(this._headers.entries())
  }

  /**
   * Set the response headers.
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
   * Get a response header value by name (case-insensitive).
   * Uses the Web Standard Headers API for proper header retrieval.
   * Special-cases "referer/referrer" for compatibility.
   * Returns null for empty or whitespace-only field names.
   *
   * @param {string} field - The header name
   * @returns {string|null} The header value or null if not found
   * @public
   */
  get (field) {
    if (!field) return null
    this._headers = this._headers || new Headers()
    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer': {
        return this._headers.get('referrer') ?? this._headers.get('referer')
      }
      default:
        return this._headers.get(field)
    }
  }

  /**
   * Get all Set-Cookie header values as an array.
   * Returns all Set-Cookie headers that will be sent with the response.
   *
   * @returns {string[]} Array of Set-Cookie header values
   * @public
   */
  getSetCookie () {
    this._headers = this._headers || new Headers()
    return this._headers.getSetCookie()
  }

  /**
   * Check if a response header is present.
   * Uses the Web Standard Headers API for case-insensitive header checking.
   *
   * @param {string} field - The header name to check
   * @returns {boolean} True if the header exists
   * @public
   */
  has (field) {
    if (!field) return false
    this._headers = this._headers || new Headers()
    return this._headers.has(field)
  }

  /**
   * Set response header(s) using the Web Standard Headers API.
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
    this._headers = this._headers || new Headers()

    if (typeof field === 'string') {
      this._headers.set(field, val)
    } else {
      Object.keys(field).forEach(header => this._headers.set(header, field[header]))
    }
  }

  /**
   * Append a response header value using the Web Standard Headers API.
   * Does not replace existing values, but appends to them.
   * This is useful for headers that can have multiple values like Set-Cookie.
   *
   * @param {string|Record<string,string>} field - The header name or headers object
   * @param {string} [val] - The value to append when field is a string
   * @public
   */
  append (field, val) {
    if (!field) return
    this._headers = this._headers || new Headers()

    if (typeof field === 'string') {
      this._headers.append(field, val)
    } else {
      Object.keys(field).forEach(header => this._headers.append(header, field[header]))
    }
  }

  /**
   * Delete a response header by name using the Web Standard Headers API.
   * Header deletion is case-insensitive.
   *
   * @param {string} field - The header name to delete
   * @public
   */
  delete (field) {
    if (!field) return
    this._headers = this._headers || new Headers()
    this._headers.delete(field)
  }

  /**
   * Get the response status code.
   * Defaults to 200 if not explicitly set.
   *
   * @returns {number} The HTTP status code
   * @public
   */
  get status () {
    return this._status || 200
  }

  /**
   * Set the response status code.
   * Automatically clears body for status codes that should not have content.
   *
   * @param {number} val - The HTTP status code (100-599)
   * @throws {TypeError} When status code is not an integer
   * @throws {TypeError} When status code is out of valid range (100–599)
   * @public
   */
  set status (val) {
    if (!Number.isInteger(val)) {
      throw new TypeError('status code must be an integer')
    }
    if (val < 100 || val > 1000) {
      throw new TypeError(`invalid status code: ${val}`)
    }
    this._status = val
    this._explicitStatus = true
    // auto update statusText when not explicitly set by user
    if (!this._explicitStatusText) {
      this._statusText = statusTextMapping[val]
    }
    if (this.body && statusEmptyMapping[val]) this.body = null
  }

  /**
   * Get the response status text.
   *
   * @returns {string} The statusText (e.g., 'OK', 'Not Found')
   * @public
   */
  get statusText () {
    if (this._explicitStatusText) {
      return this._statusText
    }
    return this._statusText || (this._statusText = statusTextMapping[this.status])
  }

  /**
   * Set a custom response status text.
   *
   * @param {string} val - The custom status text
   * @public
   */
  set statusText (val) {
    this._statusText = val
    this._explicitStatusText = true
  }

  /**
   * Get the response body.
   *
   * @returns {any} The response body content
   * @public
   */
  get body () {
    return this._body
  }

  /**
   * Set response body with automatic content-type detection.
   * Supports various body types and automatically sets appropriate headers.
   * When set to null/undefined, if current Content-Type is application/json,
   * body becomes the literal string 'null'; otherwise status is set to 204 and
   * Content-Type/Transfer-Encoding are removed.
   *
   * @param {string|Object|ReadableStream|Blob|Response|ArrayBuffer|TypedArray|FormData|URLSearchParams|null} val - The response body
   * @public
   */
  set body (val) {
    this._body = val

    // no content
    if (val == null) {
      if (!statusEmptyMapping[this.status]) {
        if (this.type === 'application/json') {
          this._body = 'null'
          return
        }
        this.status = 204
      }
      if (val === null) this._explicitNullBody = true
      this.delete('Content-Type')
      this.delete('Content-Length')
      this.delete('Transfer-Encoding')
      return
    }

    // set the status
    if (!this._explicitStatus) this.status = 200

    // set the content-type only if not yet set
    const noType = !this.has('Content-Type')

    // String
    if (typeof val === 'string') {
      if (noType) this.type = /^\s*</.test(val) ? 'html' : 'text'
      return
    }

    // Blob|ArrayBuffer|TypedArray|ReadableStream
    if (
      (val instanceof Blob) ||
      (val instanceof ArrayBuffer) ||
      ArrayBuffer.isView(val) ||
      (val instanceof ReadableStream)
    ) {
      if (noType) {
        if (val instanceof Blob && val.type) {
          this.set('Content-Type', val.type)
        } else {
          this.type = 'bin'
        }
      }
      return
    }

    // FormData
    if (val instanceof FormData) {
      return
    }

    // URLSearchParams
    if (val instanceof URLSearchParams) {
      if (noType) this.type = 'form'
      return
    }

    // Response
    if (val instanceof Response) {
      if (noType) this.type = 'bin'
      this.status = val.status
      for (const [k, v] of val.headers) this.set(k, v)
      return
    }

    // json
    if (!this.type || !/\bjson\b/i.test(this.type)) this.type = 'json'
  }

  /**
   * Perform an HTTP redirect to the specified URL.
   * Automatically sets the Location header and appropriate status code.
   * Absolute URLs are normalized and Location value is URL-encoded.
   *
   * @param {string} url - The URL to redirect to (absolute or relative)
   * @public
   */
  redirect (url) {
    if (/^https?:\/\//i.test(url)) {
      // format URL to avoid security escapes
      url = new URL(url).toString()
    }
    this.set('Location', encodeUrl(url))

    // status
    if (!statusRedirectMapping[this.status]) this.status = 302

    this.type = 'text'
    this.body = `Redirecting to ${url}.`
  }

  /**
   * Perform a special-cased "back" redirect using the Referrer header.
   * When Referrer is not present or unsafe, falls back to the provided alternative or "/".
   * Only redirects to same-origin referrers for security.
   * If referrer is an absolute URL with different origin or an invalid URL, falls back.
   *
   * @param {string} [alt='/'] - Alternative URL when referrer is unavailable or unsafe
   * @public
   */
  back (alt) {
    const referrer = this.req.get('Referrer')
    if (referrer) {
      // referrer is a relative path
      if (referrer.startsWith('/')) {
        this.redirect(referrer)
        return
      }

      // referrer is an absolute URL, check if it's the same origin
      const url = new URL(referrer, this.req.href)
      if (url.origin === this.req.origin) {
        this.redirect(referrer)
        return
      }
    }

    // no referrer, use alt or '/'
    this.redirect(alt || '/')
  }

  /**
   * Get the response Content-Type without parameters.
   * Returns only the media type without parameters (e.g., 'application/json').
   *
   * @returns {string|null} The content type, or null if not set
   * @public
   */
  get type () {
    const type = this.get('Content-Type')
    if (!type) return null
    return type.split(';', 1)[0]
  }

  /**
   * Set the response Content-Type.
   * Supports both full MIME types and shorthand aliases.
   *
   * @param {string} type - The content type or alias (e.g., 'json', 'html', 'application/json')
   * @public
   */
  set type (type) {
    if (!type) return
    type = commonTypeMapping[type] || type
    this.set('Content-Type', type)
  }

  /**
   * Get the response Content-Length as a number.
   * Returns the parsed Content-Length header value, or calculates it from the body if available.
   *
   * @returns {number|null} The content length in bytes, or null if not determinable
   * @public
   */
  get length () {
    if (this.has('Content-Length')) {
      return Number.parseInt(this.get('Content-Length'), 10) || 0
    }

    if (
      (this.body == null) ||
      (this.body instanceof ReadableStream) ||
      (this.body instanceof FormData) ||
      this.body instanceof Response
    ) {
      return null
    }
    if (typeof this.body === 'string') return new TextEncoder().encode(this.body).length
    if (this.body instanceof Blob) return this.body.size
    if (this.body instanceof ArrayBuffer) return this.body.byteLength
    if (ArrayBuffer.isView(this.body)) return this.body.byteLength
    if (this.body instanceof URLSearchParams) return new TextEncoder().encode(this.body.toString()).length

    // json
    return new TextEncoder().encode(JSON.stringify(this.body)).length
  }

  /**
   * Set the response Content-Length header.
   * Only sets the header if Transfer-Encoding is not present.
   *
   * @param {number|string} val - The content length in bytes
   * @public
   */
  set length (val) {
    if (!this.has('Transfer-Encoding')) {
      this.set('Content-Length', val)
    }
  }

  /**
   * Return JSON representation of the response.
   *
   * @returns {ResJSON}
   * @public
   */
  toJSON () {
    return {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    }
  }
}
