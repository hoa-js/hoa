import Hoa from '../../src/hoa.js'

describe('req.json()', () => {
  it('should parse JSON body', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const data = await ctx.req.json()
      ctx.res.body = data
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: JSON.stringify({ ok: true, value: 42 }),
      headers: { 'content-type': 'application/json' }
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, value: 42 })
  })

  it('should handle complex JSON objects', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const data = await ctx.req.json()
      ctx.res.body = {
        receivedType: typeof data,
        hasNestedArray: Array.isArray(data.items),
        itemCount: data.items.length
      }
    })

    const complexObject = {
      name: 'Test',
      items: [1, 2, 3],
      nested: {
        flag: true,
        meta: null
      }
    }

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: JSON.stringify(complexObject),
      headers: { 'content-type': 'application/json' }
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      receivedType: 'object',
      hasNestedArray: true,
      itemCount: 3
    })
  })

  it('should handle JSON arrays', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const data = await ctx.req.json()
      ctx.res.body = {
        isArray: Array.isArray(data),
        length: data.length,
        firstItem: data[0]
      }
    })

    const jsonArray = ['apple', 'banana', 'cherry']

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: JSON.stringify(jsonArray),
      headers: { 'content-type': 'application/json' }
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      isArray: true,
      length: 3,
      firstItem: 'apple'
    })
  })

  it('should handle JSON primitives', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const data = await ctx.req.json()
      ctx.res.body = {
        value: data,
        type: typeof data
      }
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: JSON.stringify('Hello, Hoa!'),
      headers: { 'content-type': 'application/json' }
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      value: 'Hello, Hoa!',
      type: 'string'
    })
  })

  it('should throw SyntaxError for invalid JSON', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      try {
        await ctx.req.json()
        ctx.res.body = { success: true }
      } catch (error) {
        ctx.res.status = 400
        ctx.res.body = {
          error: error.name,
          message: error.message
        }
      }
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: '{ invalid json }',
      headers: { 'content-type': 'application/json' }
    }))

    expect(res.status).toBe(400)
    const result = await res.json()
    expect(result.error).toBe('SyntaxError')
    expect(result.message).toContain('JSON')
  })

  it('should handle empty JSON body', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      try {
        const data = await ctx.req.json()
        ctx.res.body = { success: true, data }
      } catch (error) {
        ctx.res.status = 400
        ctx.res.body = { error: error.name }
      }
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: '',
      headers: { 'content-type': 'application/json' }
    }))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'SyntaxError' })
  })
})
