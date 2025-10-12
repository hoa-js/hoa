import Hoa from '../../src/hoa.js'

describe('req.search', () => {
  it('should get search with parameters', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/store/shoes?page=2&color=blue')
    const ctx = app.createContext(request)
    expect(ctx.req.search).toBe('?page=2&color=blue')
  })

  it('should return empty string when no search', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/store/shoes')
    const ctx = app.createContext(request)
    expect(ctx.req.search).toBe('')
  })

  it('should get complex search parameters', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api?filter[status]=active&sort=name&page=1')
    const ctx = app.createContext(request)
    expect(ctx.req.search).toBe('?filter[status]=active&sort=name&page=1')
  })

  it('should get encoded search parameters', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/search?q=hello%20hoa&type=user')
    const ctx = app.createContext(request)
    expect(ctx.req.search).toBe('?q=hello%20hoa&type=user')
  })

  it('should set search and update URL', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/store/shoes')
    const ctx = app.createContext(request)

    ctx.req.search = '?page=2&color=blue'
    expect(ctx.req.href).toBe('https://example.com/store/shoes?page=2&color=blue')
    expect(ctx.req.search).toBe('?page=2&color=blue')
    expect(ctx.req.query).toEqual({ page: '2', color: 'blue' })

    ctx.req.search = 'size=large&brand=nike'
    expect(ctx.req.search).toBe('?size=large&brand=nike')
    expect(ctx.req.href).toBe('https://example.com/store/shoes?size=large&brand=nike')
    expect(ctx.req.query).toEqual({ size: 'large', brand: 'nike' })
  })

  it('should clear search with empty string', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/store/shoes?page=1')
    const ctx = app.createContext(request)
    ctx.req.search = ''
    expect(ctx.req.search).toBe('')
    expect(ctx.req.href).toBe('https://example.com/store/shoes')
    expect(Object.keys(ctx.req.query)).toHaveLength(0)
  })

  it('should preserve other URL components when setting search', () => {
    const app = new Hoa()
    const request = new Request('https://example.com:8080/api/v1/users?old=param')
    const ctx = app.createContext(request)
    ctx.req.search = '?new=value&count=10'
    expect(ctx.req.href).toBe('https://example.com:8080/api/v1/users?new=value&count=10')
    expect(ctx.req.protocol).toBe('https:')
    expect(ctx.req.host).toBe('example.com:8080')
    expect(ctx.req.pathname).toBe('/api/v1/users')
    expect(ctx.req.search).toBe('?new=value&count=10')
  })

  it('should handle duplicate parameter names as arrays', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api')
    const ctx = app.createContext(request)
    ctx.req.search = '?tags=red&tags=blue&tags=green'
    expect(ctx.req.query.tags).toEqual(['red', 'blue', 'green'])
  })

  it('should handle URL encoding in parameters', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/search')
    const ctx = app.createContext(request)
    ctx.req.search = '?q=hello+hoa&filter[type]=user'
    expect(ctx.req.search).toBe('?q=hello+hoa&filter[type]=user')
    expect(ctx.req.query.q).toBe('hello hoa')
    expect(ctx.req.query['filter[type]']).toBe('user')
  })
})
