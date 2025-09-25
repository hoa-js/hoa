import Hoa from '../../src/application.js'

describe('req.blob()', () => {
  it('should read request body as Blob', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const blob = await ctx.req.blob()
      const text = await blob.text()
      ctx.res.body = text
    })

    const body = new Blob(['Hello, Hoa!'], { type: 'text/plain' })

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello, Hoa!')
  })

  it('should preserve Blob type and size', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const blob = await ctx.req.blob()
      ctx.res.body = {
        type: blob.type,
        size: blob.size,
        content: await blob.text()
      }
    })

    const body = new Blob(['Hello, Hoa!'], { type: 'text/plain' })

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      type: 'text/plain',
      size: 11,
      content: 'Hello, Hoa!'
    })
  })

  it('should handle empty Blob', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const blob = await ctx.req.blob()
      ctx.res.body = {
        size: blob.size,
        content: await blob.text()
      }
    })

    const body = new Blob([])

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      size: 0,
      content: ''
    })
  })

  it('should handle binary Blob data', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const blob = await ctx.req.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      ctx.res.body = Array.from(uint8Array)
    })

    const binaryData = new Uint8Array([0x89, 0x50, 0x4E, 0x47]) // PNG header
    const body = new Blob([binaryData], { type: 'image/png' })

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([137, 80, 78, 71])
  })
})
