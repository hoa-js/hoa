import Hoa from '../../src/hoa.js'

describe('req.formData()', () => {
  it('should parse form-data body', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const form = await ctx.req.formData()
      ctx.res.body = form.get('name')
    })

    const fd = new FormData()
    fd.append('name', 'Hoa')

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body: fd }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hoa')
  })

  it('should handle multiple form fields', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const form = await ctx.req.formData()
      ctx.res.body = {
        name: form.get('name'),
        email: form.get('email'),
        age: form.get('age')
      }
    })

    const fd = new FormData()
    fd.append('name', 'John Doe')
    fd.append('email', 'john@example.com')
    fd.append('age', '30')

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body: fd }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      age: '30'
    })
  })

  it('should handle multiple values for same field', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const form = await ctx.req.formData()
      ctx.res.body = {
        singleValue: form.get('hobby'),
        allValues: form.getAll('hobby')
      }
    })

    const fd = new FormData()
    fd.append('hobby', 'reading')
    fd.append('hobby', 'coding')
    fd.append('hobby', 'gaming')

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body: fd }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      singleValue: 'reading',
      allValues: ['reading', 'coding', 'gaming']
    })
  })

  it('should handle file uploads in FormData', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const form = await ctx.req.formData()
      const file = form.get('upload')

      ctx.res.body = {
        hasFile: file instanceof File,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        content: file ? await file.text() : null
      }
    })

    const fd = new FormData()
    const file = new File(['Hello, Hoa!'], 'test.txt', { type: 'text/plain' })
    fd.append('upload', file)

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body: fd }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      hasFile: true,
      fileName: 'test.txt',
      fileSize: 11,
      fileType: 'text/plain',
      content: 'Hello, Hoa!'
    })
  })

  it('should handle empty FormData', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const form = await ctx.req.formData()
      const entries = Array.from(form.entries())
      ctx.res.body = {
        isEmpty: entries.length === 0,
        entryCount: entries.length
      }
    })

    const fd = new FormData()

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body: fd }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      isEmpty: true,
      entryCount: 0
    })
  })

  it('should handle URLSearchParams as form data', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const form = await ctx.req.formData()
      ctx.res.body = {
        username: form.get('username'),
        password: form.get('password')
      }
    })

    const params = new URLSearchParams()
    params.append('username', 'testuser')
    params.append('password', 'secret123')

    const res = await app.fetch(new Request('https://example.com/', {
      method: 'POST',
      body: params,
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      username: 'testuser',
      password: 'secret123'
    })
  })

  it('should handle mixed content in FormData', async () => {
    const app = new Hoa()

    app.use(async (ctx) => {
      const form = await ctx.req.formData()
      const file = form.get('document')

      ctx.res.body = {
        title: form.get('title'),
        description: form.get('description'),
        hasDocument: file instanceof File,
        documentName: file?.name
      }
    })

    const fd = new FormData()
    fd.append('title', 'My Document')
    fd.append('description', 'A test document')
    const file = new File(['PDF content'], 'document.pdf', { type: 'application/pdf' })
    fd.append('document', file)

    const res = await app.fetch(new Request('https://example.com/', { method: 'POST', body: fd }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      title: 'My Document',
      description: 'A test document',
      hasDocument: true,
      documentName: 'document.pdf'
    })
  })
})
