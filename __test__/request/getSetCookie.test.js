import Hoa from '../../src/application.js'

describe('req.getSetCookie()', () => {
  it('should return all Set-Cookie headers as an array', () => {
    const app = new Hoa()
    const headers = new Headers()
    headers.append('set-cookie', 'sessionId=123; Path=/; HttpOnly')
    headers.append('set-cookie', 'theme=dark; Path=/; Max-Age=3600')

    const request = new Request('https://example.com/', { headers })
    const ctx = app.createContext(request)

    const setCookies = ctx.req.getSetCookie()
    expect(setCookies).toEqual([
      'sessionId=123; Path=/; HttpOnly',
      'theme=dark; Path=/; Max-Age=3600'
    ])
  })

  it('should return empty array when no Set-Cookie headers exist', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: { 'content-type': 'application/json' }
    })
    const ctx = app.createContext(request)

    const setCookies = ctx.req.getSetCookie()
    expect(setCookies).toEqual([])
  })

  it('should handle single Set-Cookie header', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: { 'set-cookie': 'token=123; Secure' }
    })
    const ctx = app.createContext(request)

    const setCookies = ctx.req.getSetCookie()
    expect(setCookies).toEqual(['token=123; Secure'])
  })

  it('should work after headers are modified', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    // Modify headers first
    ctx.req.headers = {
      'set-cookie': 'modified=true; Path=/'
    }

    const setCookies = ctx.req.getSetCookie()
    expect(setCookies).toEqual(['modified=true; Path=/'])
  })

  it('should work with headers setter', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    // Use headers setter with multiple Set-Cookie values
    const headers = new Headers()
    headers.append('set-cookie', 'first=value1; Path=/')
    headers.append('set-cookie', 'second=value2; Path=/admin')

    ctx.req.headers = headers

    const setCookies = ctx.req.getSetCookie()
    expect(setCookies).toEqual([
      'first=value1; Path=/',
      'second=value2; Path=/admin'
    ])
  })

  it('should initialize headers when _headers is undefined', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    // Reset _headers to undefined to test initialization path
    ctx.req._headers = undefined

    // Call getSetCookie which should initialize _headers from ctx.request.headers
    const setCookies = ctx.req.getSetCookie()
    expect(setCookies).toEqual([])
    expect(ctx.req._headers).toBeInstanceOf(Headers)
  })
})
