import Hoa from '../../src/hoa.js'

describe('req.headers', () => {
  it('should return the request headers object (case-insensitive)', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: {
        'Content-Type': 'application/json',
        'X-Foo': 'foo'
      }
    })
    const ctx = app.createContext(request)

    const headers = ctx.req.headers
    expect(headers['content-type']).toBe('application/json')
    expect(headers['x-foo']).toBe('foo')
  })

  it('should set headers from plain object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.req.headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token123',
      'X-Foo': 'foo'
    }

    const headers = ctx.req.headers
    expect(headers['content-type']).toBe('application/json')
    expect(headers['authorization']).toBe('Bearer token123')
    expect(headers['x-foo']).toBe('foo')
  })

  it('should set headers from Headers object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    const headersObj = new Headers([
      ['Content-Type', 'text/html'],
      ['Cache-Control', 'no-cache'],
      ['x-powered-by', 'Hoa']
    ])
    ctx.req.headers = headersObj

    const headers = ctx.req.headers
    expect(headers['content-type']).toBe('text/html')
    expect(headers['cache-control']).toBe('no-cache')
    expect(headers['x-powered-by']).toBe('Hoa')
  })

  it('should set headers from array of entries', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)

    ctx.req.headers = [
      ['Accept', 'application/json'],
      ['User-Agent', 'Hoa-Client/1.0'],
      ['X-Foo', 'foo']
    ]

    const headers = ctx.req.headers
    expect(headers['accept']).toBe('application/json')
    expect(headers['user-agent']).toBe('Hoa-Client/1.0')
    expect(headers['x-foo']).toBe('foo')
  })

  it('should replace all existing headers when setting new ones', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: {
        'original-header': 'original-value',
        'content-type': 'text/plain'
      }
    })
    const ctx = app.createContext(request)

    let headers = ctx.req.headers
    expect(headers['original-header']).toBe('original-value')
    expect(headers['content-type']).toBe('text/plain')

    ctx.req.headers = {
      'new-header': 'new-value',
      'content-type': 'application/json'
    }

    headers = ctx.req.headers
    expect(headers['new-header']).toBe('new-value')
    expect(headers['content-type']).toBe('application/json')
    expect(headers['original-header']).toBeUndefined()
  })

  it('should handle empty headers object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      headers: { existing: 'value' }
    })
    const ctx = app.createContext(request)

    ctx.req.headers = {}

    const headers = ctx.req.headers
    expect(Object.keys(headers)).toHaveLength(0)
    expect(headers['existing']).toBeUndefined()
  })
})
