import Hoa from '../../src/application.js'

describe('req.text()', () => {
  it('should read request body as text', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const text = await ctx.req.text()
      ctx.res.body = text.toUpperCase()
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: 'Hello, Hoa!',
      headers: { 'content-type': 'text/plain' }
    }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('HELLO, HOA!')
  })

  it('should handle empty text body', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const text = await ctx.req.text()
      ctx.res.body = {
        isEmpty: text === '',
        length: text.length
      }
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: '',
      headers: { 'content-type': 'text/plain' }
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ isEmpty: true, length: 0 })
  })

  it('should handle UTF-8 encoded text', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const text = await ctx.req.text()
      ctx.res.body = text
    })

    const unicodeText = '你好世界 🌍'
    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: unicodeText,
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe(unicodeText)
  })

  it('should handle multiline text', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const text = await ctx.req.text()
      const lines = text.split('\n')
      ctx.res.body = {
        lineCount: lines.length,
        firstLine: lines[0],
        lastLine: lines[lines.length - 1]
      }
    })

    const multilineText = 'Line 1\nLine 2\nLine 3'
    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: multilineText,
      headers: { 'content-type': 'text/plain' }
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      lineCount: 3,
      firstLine: 'Line 1',
      lastLine: 'Line 3'
    })
  })

  it('should handle large text content', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const text = await ctx.req.text()
      ctx.res.body = {
        length: text.length,
        startsWithA: text.startsWith('A'),
        endsWithZ: text.endsWith('Z')
      }
    })

    const largeText = 'A'.repeat(10000) + 'Z'
    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: largeText,
      headers: { 'content-type': 'text/plain' }
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      length: 10001,
      startsWithA: true,
      endsWithZ: true
    })
  })
})
