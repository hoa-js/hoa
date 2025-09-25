import Hoa from '../../src/application.js'

describe('req.body', () => {
  it('should get and set request body stream', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const originalBody = ctx.req.body
      expect(originalBody).toBeInstanceOf(ReadableStream)

      const customText = 'Custom body content'
      ctx.req.body = customText
      expect(ctx.req.body).toBe(customText)

      ctx.res.body = customText
    })

    const originalText = 'Original body'
    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: originalText,
      headers: { 'content-type': 'text/plain' }
    }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Custom body content')
  })

  it('should cache body stream on first access', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const body1 = ctx.req.body
      const body2 = ctx.req.body

      expect(body1).toBe(body2)

      ctx.res.body = 'OK'
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: 'test body'
    }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('OK')
  })

  it('should handle null body', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      // Set body to null
      ctx.req.body = null
      expect(ctx.req.body).toBe(null)

      ctx.res.body = 'Body is null'
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'GET'
    }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Body is null')
  })
})
