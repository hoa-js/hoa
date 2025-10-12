import Hoa from '../../src/hoa.js'

describe('res.toJSON()', () => {
  it('should return JSON with status, statusText, and headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.status = 201
    ctx.res.set('X-Foo', 'bar')
    ctx.res.type = 'json'
    const json = ctx.res.toJSON()
    expect(json.status).toBe(201)
    expect(json.statusText).toBe('Created')
    expect(json.headers['x-foo']).toBe('bar')
    expect(json.headers['content-type']).toBe('application/json')
  })

  it('should not include body in JSON', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.res.body = 'Hello, Hoa!'
    const json = ctx.res.toJSON()
    expect(json.body).toBeUndefined()
  })
})
