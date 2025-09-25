import Hoa from '../../src/application.js'

describe('res.headers', () => {
  it('should return the response header object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('X-Foo', 'bar')
    expect(ctx.res.headers).toEqual({ 'x-foo': 'bar' })
  })

  it('should set headers from plain object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.res.headers = {
      'content-type': 'application/json',
      'cache-control': 'no-cache',
      'x-powered-by': 'Hoa'
    }

    const headers = ctx.res.headers
    expect(headers['content-type']).toBe('application/json')
    expect(headers['cache-control']).toBe('no-cache')
    expect(headers['x-powered-by']).toBe('Hoa')
  })

  it('should set headers from Headers object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    const headersObj = new Headers([
      ['content-type', 'text/html'],
      ['set-cookie', 'session=abc123'],
      ['location', '/redirect']
    ])
    ctx.res.headers = headersObj

    const headers = ctx.res.headers
    expect(headers['content-type']).toBe('text/html')
    expect(headers['set-cookie']).toBe('session=abc123')
    expect(headers['location']).toBe('/redirect')
  })

  it('should set headers from array of entries', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.res.headers = [
      ['content-type', 'application/xml'],
      ['access-control-allow-origin', '*'],
      ['x-response-time', '123ms']
    ]

    const headers = ctx.res.headers
    expect(headers['content-type']).toBe('application/xml')
    expect(headers['access-control-allow-origin']).toBe('*')
    expect(headers['x-response-time']).toBe('123ms')
  })

  it('should replace all existing headers when setting new ones', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.res.set('original-header', 'original-value')
    ctx.res.set('content-type', 'text/plain')

    let headers = ctx.res.headers
    expect(headers['original-header']).toBe('original-value')
    expect(headers['content-type']).toBe('text/plain')

    ctx.res.headers = {
      'new-header': 'new-value',
      'content-type': 'application/json'
    }

    headers = ctx.res.headers
    expect(headers['new-header']).toBe('new-value')
    expect(headers['content-type']).toBe('application/json')
    expect(headers['original-header']).toBeUndefined()
  })

  it('should handle empty headers object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.res.set('existing', 'value')
    expect(ctx.res.headers['existing']).toBe('value')

    ctx.res.headers = {}

    const headers = ctx.res.headers
    expect(Object.keys(headers)).toHaveLength(0)
    expect(headers['existing']).toBeUndefined()
  })

  it('should work with multiple set-cookie headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    const headersObj = new Headers()
    headersObj.append('set-cookie', 'session=abc123')
    headersObj.append('set-cookie', 'theme=dark')

    expect([...headersObj.entries()]).toEqual([
      ['set-cookie', 'session=abc123'],
      ['set-cookie', 'theme=dark']
    ])

    ctx.res.headers = headersObj

    const headers = ctx.res.headers
    expect(headers['set-cookie']).toBe('theme=dark')
  })

  it('should preserve header case normalization', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.res.headers = {
      'Content-Type': 'application/json',
      'X-FOO': 'foo',
      'cache-CONTROL': 'max-age=3600'
    }

    const headers = ctx.res.headers
    expect(headers['content-type']).toBe('application/json')
    expect(headers['x-foo']).toBe('foo')
    expect(headers['cache-control']).toBe('max-age=3600')
  })
})
