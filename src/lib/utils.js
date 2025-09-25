/**
 * Parse URLSearchParams into a query object, handling multiple values for the same key.
 * When a key appears multiple times, values are collected into an array.
 *
 * @param {URLSearchParams} searchParams - The URLSearchParams object to parse
 * @returns {Record<string, string|string[]>} Query object with string values or arrays for multiple values
 * @public
 */
export function parseSearchParamsToQuery (searchParams) {
  const query = {}
  for (const [key, value] of searchParams) {
    if (query[key] !== undefined) {
      query[key] = [].concat(query[key], value)
    } else {
      query[key] = value
    }
  }
  return query
}

/**
 * Convert a query object to a URL query string.
 * Handles arrays by appending multiple parameters with the same key.
 *
 * @param {Record<string, string|string[]|undefined|null>} query - Query object to stringify
 * @returns {string} URL-encoded query string (without leading '?')
 * @public
 */
export function stringifyQueryToString (query) {
  if (!query) {
    return ''
  }
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v ?? ''))
    } else {
      params.append(key, value ?? '')
    }
  }
  return params.toString()
}

/**
 * Mapping of HTTP status codes to their standard reason phrases.
 *
 * @type {Record<number, string>}
 * @public
 */
export const statusTextMapping = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a Teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',
  511: 'Network Authentication Required'
}

/**
 * Mapping of HTTP status codes that indicate redirects.
 * Used to determine if a response should trigger a redirect.
 *
 * @type {Record<number, boolean>}
 * @readonly
 * @public
 */
export const statusRedirectMapping = {
  300: true,
  301: true,
  302: true,
  303: true,
  305: true,
  307: true,
  308: true
}

/**
 * Mapping of HTTP status codes that should have empty response bodies.
 * These status codes by specification should not include a message body.
 *
 * @type {Record<number, boolean>}
 * @readonly
 * @public
 */
export const statusEmptyMapping = {
  204: true,
  205: true,
  304: true
}

/**
 * Mapping of common content type aliases to their full MIME types.
 * Provides convenient shortcuts for setting response content types.
 *
 * @type {Record<string, string>}
 * @readonly
 * @public
 */
export const commonTypeMapping = {
  // Text types
  html: 'text/html;charset=UTF-8',
  text: 'text/plain;charset=UTF-8',
  xml: 'text/xml;charset=UTF-8',
  md: 'text/markdown;charset=UTF-8',

  // Application types
  json: 'application/json',
  form: 'application/x-www-form-urlencoded;charset=UTF-8',
  pdf: 'application/pdf',
  zip: 'application/zip',
  wasm: 'application/wasm',
  webmanifest: 'application/manifest+json',

  // JavaScript/TypeScript
  js: 'application/javascript;charset=UTF-8',
  ts: 'application/typescript;charset=UTF-8',

  // Image types
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',

  // Audio types
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',

  // Video types
  mp4: 'video/mp4',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',

  // Font types
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',

  // Binary
  bin: 'application/octet-stream'
}

const ENCODE_CHARS_REGEXP = /(?:[^\x21\x23-\x3B\x3D\x3F-\x5F\x61-\x7A\x7C\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g

/**
 * RegExp to match unmatched surrogate pair.
 * @private
 */

const UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g

/**
 * String to replace unmatched surrogate pair with.
 * @private
 */

const UNMATCHED_SURROGATE_PAIR_REPLACE = '$1\uFFFD$2'

/**
 * Encode a URL to a percent-encoded form, excluding already-encoded sequences.
 *
 * This function will take an already-encoded URL and encode all the non-URL
 * code points. This function will not encode the "%" character unless it is
 * not part of a valid sequence (`%20` will be left as-is, but `%foo` will
 * be encoded as `%25foo`).
 *
 * This encode is meant to be "safe" and does not throw errors. It will try as
 * hard as it can to properly encode the given URL, including replacing any raw,
 * unpaired surrogate pairs with the Unicode replacement character prior to
 * encoding.
 *
 * @param {string} url
 * @return {string}
 * @public
 */

export function encodeUrl (url) {
  return String(url)
    .replace(UNMATCHED_SURROGATE_PAIR_REGEXP, UNMATCHED_SURROGATE_PAIR_REPLACE)
    .replace(ENCODE_CHARS_REGEXP, encodeURI)
}
