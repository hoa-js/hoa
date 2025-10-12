import Hoa from '../../src/hoa.js'

describe('req.query', () => {
  it('should return empty object when no query', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    expect(Object.keys(ctx.req.query)).toHaveLength(0)
  })

  it('should cache query object', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    const query1 = ctx.req.query
    const query2 = ctx.req.query
    expect(query1).toBe(query2)
  })

  it('should get single query parameter', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/?page=2')
    const ctx = app.createContext(request)
    expect(ctx.req.query.page).toBe('2')
  })

  it('should get duplicate parameters as array', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/?tags=red&tags=blue&tags=green')
    const ctx = app.createContext(request)
    expect(ctx.req.query.tags).toEqual(['red', 'blue', 'green'])
  })

  it('should get complex query parameters', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/?page=2&limit=10&sort=name&filter[status]=active&filter[type]=user')
    const ctx = app.createContext(request)
    expect(ctx.req.query.page).toBe('2')
    expect(ctx.req.query.limit).toBe('10')
    expect(ctx.req.query.sort).toBe('name')
    expect(ctx.req.query['filter[status]']).toBe('active')
    expect(ctx.req.query['filter[type]']).toBe('user')
  })

  it('should set query and update search', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/store/shoes')
    const ctx = app.createContext(request)
    ctx.req.query = { page: 2, color: 'blue' }
    expect(ctx.req.search).toBe('?page=2&color=blue')
    expect(ctx.req.query).toEqual({ page: '2', color: 'blue' })
  })

  it('should set query with array values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/products')
    const ctx = app.createContext(request)
    ctx.req.query = { tags: ['red', 'blue'], category: 'clothing' }
    expect(ctx.req.search).toBe('?tags=red&tags=blue&category=clothing')
    expect(ctx.req.query).toEqual({ tags: ['red', 'blue'], category: 'clothing' })
  })

  it('should set query with empty string values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/search')
    const ctx = app.createContext(request)
    ctx.req.query = { q: '', page: 1 }
    expect(ctx.req.search).toBe('?q=&page=1')
    expect(ctx.req.query).toEqual({ q: '', page: '1' })
  })

  it('should set query with null and undefined values', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/api')
    const ctx = app.createContext(request)
    ctx.req.query = { active: null, deleted: undefined, page: 1 }
    expect(ctx.req.search).toBe('?active=&deleted=&page=1')
    expect(ctx.req.query).toEqual({ active: '', deleted: '', page: '1' })
  })
})
