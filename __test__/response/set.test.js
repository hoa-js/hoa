import Hoa from '../../src/application.js'

describe('res.set(name, val)', () => {
  it('should set a field value', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('x-foo', 'bar')
    expect(ctx.res.get('x-foo')).toBe('bar')
  })

  it('should coerce number to string', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('x-foo', 5)
    expect(ctx.res.get('x-foo')).toBe('5')
  })

  it('should handle undefined values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('x-foo', undefined)
    expect(ctx.res.get('x-foo')).toBe('undefined')
  })

  it('should handle null values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('x-foo', null)
    expect(ctx.res.get('x-foo')).toBe('null')
  })

  it('should handle boolean values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('x-enabled', true)
    ctx.res.set('x-disabled', false)
    expect(ctx.res.get('x-enabled')).toBe('true')
    expect(ctx.res.get('x-disabled')).toBe('false')
  })

  it('should be case insensitive', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('Content-Type', 'application/json')
    expect(ctx.res.get('content-type')).toBe('application/json')
    expect(ctx.res.get('CONTENT-TYPE')).toBe('application/json')
  })

  it('should overwrite existing headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set('x-test', 'first')
    ctx.res.set('x-test', 'second')
    expect(ctx.res.get('x-test')).toBe('second')
  })

  it('should set multiple fields from object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set({
      'x-foo': '1',
      'x-bar': '2',
      'content-type': 'application/json'
    })
    expect(ctx.res.get('x-foo')).toBe('1')
    expect(ctx.res.get('x-bar')).toBe('2')
    expect(ctx.res.get('content-type')).toBe('application/json')
  })

  it('should handle mixed value types in object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.set({
      'x-string': 'Hello, Hoa!',
      'x-number': 42,
      'x-boolean': true,
      'x-null': null
    })
    expect(ctx.res.get('x-string')).toBe('Hello, Hoa!')
    expect(ctx.res.get('x-number')).toBe('42')
    expect(ctx.res.get('x-boolean')).toBe('true')
    expect(ctx.res.get('x-null')).toBe('null')
  })

  it('should handle empty object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => ctx.res.set({})).not.toThrow()
  })

  it('should return null for empty name in get', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(ctx.res.get('')).toBeNull()
    expect(ctx.res.get(null)).toBeNull()
    expect(ctx.res.get(undefined)).toBeNull()
  })

  it('should not throw for falsy name in set', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(() => ctx.res.set('', 'x')).not.toThrow()
    expect(Object.keys(ctx.res.headers).length).toBe(0)
    expect(() => ctx.res.set(null, 'x')).not.toThrow()
    expect(() => ctx.res.set(undefined, 'x')).not.toThrow()
    expect(Object.keys(ctx.res.headers).length).toBe(0)
  })
})
