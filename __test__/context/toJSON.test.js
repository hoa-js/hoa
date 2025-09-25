import Hoa from '../../src/application.js'

describe('ctx.toJSON()', () => {
  it('should return a serializable JSON representation', () => {
    const app = new Hoa()
    const request = new Request('https://example.com/', {
      method: 'POST',
      headers: {
        'content-type': 'text/plain'
      }
    })
    const ctx = app.createContext(request)

    ctx.res.status = 200
    ctx.res.body = '<p>Hey</p>'

    const obj = ctx.toJSON()

    expect(obj.app).toBeDefined()
    expect(obj.req.method).toBe('POST')
    expect(obj.res.status).toBe(200)

    const jsonString = JSON.stringify(ctx)
    const parsed = JSON.parse(jsonString)

    expect(parsed.app).toBeDefined()
    expect(parsed.req.method).toBe('POST')
    expect(parsed.res.status).toBe(200)
  })
})
