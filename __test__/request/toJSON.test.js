import Hoa from '../../src/application.js'

describe('req.toJSON()', () => {
  it('should return JSON with basic request info', () => {
    const app = new Hoa()
    const request = new Request('https://api.example.com/users?active=1', {
      method: 'POST',
      headers: {
        'X-Foo': 'bar',
        'Content-Type': 'application/json'
      }
    })
    const ctx = app.createContext(request)
    const json = ctx.req.toJSON()
    expect(json.method).toBe('POST')
    expect(json.url).toBe('https://api.example.com/users?active=1')
    expect(json.headers).toEqual({ 'x-foo': 'bar', 'content-type': 'application/json' })
  })

  it('should include mutated headers', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/')
    const ctx = app.createContext(request)
    ctx.req.set('X-Test', '1')
    ctx.req.set({ 'X-Foo': 'foo', 'X-Bar': 'bar' })
    const json = ctx.req.toJSON()
    expect(json.headers).toEqual({ 'x-test': '1', 'x-foo': 'foo', 'x-bar': 'bar' })
  })
})
