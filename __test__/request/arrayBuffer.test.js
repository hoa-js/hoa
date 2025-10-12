import Hoa from '../../src/hoa.js'

describe('req.arrayBuffer()', () => {
  it('should read request body as ArrayBuffer', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const arrayBuffer = await ctx.req.arrayBuffer()
      const text = new TextDecoder().decode(arrayBuffer)
      ctx.res.body = text
    })

    const encoder = new TextEncoder()
    const buf = encoder.encode('Hello, Hoa!')

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body: buf }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello, Hoa!')
  })

  it('should handle empty ArrayBuffer', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const arrayBuffer = await ctx.req.arrayBuffer()
      ctx.res.body = { length: arrayBuffer.byteLength }
    })

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: new ArrayBuffer(0)
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ length: 0 })
  })

  it('should handle binary data in ArrayBuffer', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const arrayBuffer = await ctx.req.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      ctx.res.body = Array.from(uint8Array)
    })

    const binaryData = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]) // "Hello" in bytes
    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: binaryData
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([72, 101, 108, 108, 111])
  })
})
