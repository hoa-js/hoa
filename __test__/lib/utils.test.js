import { parseSearchParamsToQuery, stringifyQueryToString, encodeUrl, statusTextMapping, statusEmptyMapping, statusRedirectMapping, commonTypeMapping } from '../../src/lib/utils.js'

describe('lib/utils', () => {
  it('parseSearchParamsToQuery() should collect duplicate keys to array', () => {
    const sp = new URLSearchParams('a=1&a=2&b=3')
    const q = parseSearchParamsToQuery(sp)
    expect(q).toEqual({ a: ['1', '2'], b: '3' })
  })

  it('stringifyQueryToString() should handle various inputs', () => {
    const q = { a: ['1', null, '3'], b: undefined, c: '4' }
    expect(stringifyQueryToString(q)).toBe('a=1&a=&a=3&b=&c=4')
    expect(stringifyQueryToString(null)).toBe('')
    expect(stringifyQueryToString(undefined)).toBe('')
    expect(stringifyQueryToString({})).toBe('')
  })

  it('encodeUrl() should safely encode invalid sequences', () => {
    const raw = 'http://example.com/%zz/\uD800test\uDC00'
    const encoded = encodeUrl(raw)
    expect(encoded).toBe('http://example.com/%25zz/%EF%BF%BDtest%EF%BF%BD')
    expect(() => new URL(encoded)).not.toThrow()
  })

  it('should provide correct constant mappings', () => {
    expect(statusTextMapping[200]).toBe('OK')
    expect(statusTextMapping[404]).toBe('Not Found')

    expect(statusEmptyMapping[204]).toBe(true)
    expect(statusEmptyMapping[205]).toBe(true)
    expect(statusEmptyMapping[304]).toBe(true)

    expect(statusRedirectMapping[300]).toBe(true)
    expect(statusRedirectMapping[301]).toBe(true)
    expect(statusRedirectMapping[302]).toBe(true)
    expect(statusRedirectMapping[303]).toBe(true)
    expect(statusRedirectMapping[305]).toBe(true)
    expect(statusRedirectMapping[307]).toBe(true)
    expect(statusRedirectMapping[308]).toBe(true)

    expect(commonTypeMapping.html).toBe('text/html;charset=UTF-8')
    expect(commonTypeMapping.json).toBe('application/json')
  })
})
