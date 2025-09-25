import Hoa from '../../src/application.js'

describe('res.getSetCookie()', () => {
  it('should return all Set-Cookie headers as an array', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    // Set multiple Set-Cookie headers
    ctx.res.append('set-cookie', 'sessionId=123; Path=/; HttpOnly')
    ctx.res.append('set-cookie', 'theme=dark; Path=/; Max-Age=3600')

    const setCookies = ctx.res.getSetCookie()
    expect(setCookies).toEqual([
      'sessionId=123; Path=/; HttpOnly',
      'theme=dark; Path=/; Max-Age=3600'
    ])
  })

  it('should return empty array when no Set-Cookie headers exist', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.res.set('content-type', 'application/json')

    const setCookies = ctx.res.getSetCookie()
    expect(setCookies).toEqual([])
  })

  it('should handle single Set-Cookie header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.res.set('set-cookie', 'token=123; Secure')

    const setCookies = ctx.res.getSetCookie()
    expect(setCookies).toEqual(['token=123; Secure'])
  })

  it('should work with headers setter', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    // Use headers setter with multiple Set-Cookie values
    const headers = new Headers()
    headers.append('set-cookie', 'first=value1; Path=/')
    headers.append('set-cookie', 'second=value2; Path=/admin')

    ctx.res.headers = headers

    const setCookies = ctx.res.getSetCookie()
    expect(setCookies).toEqual([
      'first=value1; Path=/',
      'second=value2; Path=/admin'
    ])
  })

  it('should initialize headers when _headers is undefined', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    // Ensure _headers is undefined initially
    expect(ctx.res._headers).toBeUndefined()

    // Call getSetCookie which should initialize _headers
    const setCookies = ctx.res.getSetCookie()
    expect(setCookies).toEqual([])
    expect(ctx.res._headers).toBeInstanceOf(Headers)
  })
})
