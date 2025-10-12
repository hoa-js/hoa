import Hoa from '../../src/hoa.js'

describe('app respond', () => {
  describe('when no middleware is present', () => {
    it('should respond with 404', async () => {
      const app = new Hoa()

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(404)
    })

    it('should respond with 200 and empty body when status is set but body is undefined', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.status = 200
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-length')).toBeNull()
      expect(await res.text()).toBe('')
    })

    it('should respond with 200 and empty body when body is null', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = null
        ctx.res.status = 200
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-length')).toBe('0')
      expect(await res.text()).toBe('')
    })
  })

  describe('when HEAD is used', () => {
    it('should not send body but include correct content-length for string', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = 'Hello, Hoa!'
      })

      const res = await app.fetch(new Request('https://example.com/', { method: 'HEAD' }))

      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/plain;charset=UTF-8')
      expect(res.headers.get('content-length')).toBe('11')
      expect(await res.text()).toBe('')
    })

    it('should set correct content-length for JSON objects', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = { message: 'Hello, Hoa!' }
      })

      const res = await app.fetch(new Request('https://example.com/', { method: 'HEAD' }))

      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/json')
      expect(res.headers.get('content-length')).toBe('25')
      expect(await res.text()).toBe('')
    })

    it('should set correct content-length for Blob objects', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new Blob(['Hello, Hoa!'], { type: 'text/plain' })
      })

      const res = await app.fetch(new Request('https://example.com/', { method: 'HEAD' }))

      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/plain')
      expect(res.headers.get('content-length')).toBe('11')
      expect(await res.text()).toBe('')
    })

    it('should set correct content-length for ArrayBuffer objects', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        const buffer = new TextEncoder().encode('Hello, Hoa!')
        ctx.res.body = buffer.buffer
      })

      const res = await app.fetch(new Request('https://example.com/', { method: 'HEAD' }))

      expect(res.status).toBe(200)
      expect(res.headers.get('content-length')).toBe('11')
      expect(await res.text()).toBe('')
    })

    it('should handle null body correctly', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = null
      })

      const res = await app.fetch(new Request('https://example.com/', { method: 'HEAD' }))

      expect(res.status).toBe(204)
      expect(res.headers.get('content-length')).toBeNull()
      expect(await res.text()).toBe('')
    })

    it('should preserve existing content-length header', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = { data: 'test' }
        ctx.res.set('Content-Length', '100')
      })

      const res = await app.fetch(new Request('https://example.com/', { method: 'HEAD' }))

      expect(res.status).toBe(200)
      expect(res.headers.get('content-length')).toBe('100')
      expect(await res.text()).toBe('')
    })
  })

  describe('when status requires empty body (statusEmptyMapping)', () => {
    it('should ignore body for 204, 205, 304 status codes', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = 'This should be ignored'
        ctx.res.set('X-Foo', 'foo')

        switch (ctx.req.pathname) {
          case '/204':
            ctx.res.status = 204
            break
          case '/205':
            ctx.res.status = 205
            break
          case '/304':
            ctx.res.status = 304
            break
        }
      })

      const res204 = await app.fetch(new Request('https://example.com/204'))
      expect(res204.status).toBe(204)
      expect(await res204.text()).toBe('')
      expect(res204.headers.get('x-foo')).toBe('foo')

      const res205 = await app.fetch(new Request('https://example.com/205'))
      expect(res205.status).toBe(205)
      expect(await res205.text()).toBe('')
      expect(res205.headers.get('x-foo')).toBe('foo')

      const res304 = await app.fetch(new Request('https://example.com/304'))
      expect(res304.status).toBe(304)
      expect(await res304.text()).toBe('')
      expect(res304.headers.get('x-foo')).toBe('foo')
    })

    it('should not ignore body for other status codes', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = 'This should NOT be ignored'
        ctx.res.status = 200
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(await res.text()).toBe('This should NOT be ignored')
    })
  })

  describe('when body is missing, null or undefined', () => {
    it('should respond with empty body for various statuses when body is not set', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        switch (ctx.req.pathname) {
          case '/400':
            ctx.res.status = 400
            break
          case '/204':
            ctx.res.status = 204
            break
          case '/304':
            ctx.res.status = 304
            break
        }
      })

      const res400 = await app.fetch(new Request('https://example.com/400'))
      expect(res400.status).toBe(400)
      expect(await res400.text()).toBe('')

      const res204 = await app.fetch(new Request('https://example.com/204'))
      expect(res204.status).toBe(204)
      expect(await res204.text()).toBe('')

      const res304 = await app.fetch(new Request('https://example.com/304'))
      expect(res304.status).toBe(304)
      expect(await res304.text()).toBe('')
    })

    it('should respond with 204 when body is explicitly null or undefined', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        if (ctx.req.pathname.includes('null')) {
          ctx.res.body = null
        } else {
          ctx.res.body = undefined
        }
      })

      const nullRes = await app.fetch(new Request('https://example.com/null'))
      expect(nullRes.status).toBe(204)
      expect(await nullRes.text()).toBe('')

      const undefinedRes = await app.fetch(new Request('https://example.com/undefined'))
      expect(undefinedRes.status).toBe(204)
      expect(await undefinedRes.text()).toBe('')
    })
  })

  describe('when body is a string', () => {
    it('should respond with the string', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = 'Hello, Hoa!'
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(await res.text()).toBe('Hello, Hoa!')
      expect(res.headers.get('content-type')).toBe('text/plain;charset=UTF-8')
    })
  })

  describe('when body is an object', () => {
    it('should respond with JSON', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = { hello: 'Hoa' }
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/json')
      expect(await res.json()).toEqual({ hello: 'Hoa' })
    })
  })

  describe('when body is a Blob', () => {
    it('should respond with blob content', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new Blob(['Hello, Hoa!'], { type: 'text/plain' })
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/plain')
      expect(await res.text()).toBe('Hello, Hoa!')
    })
  })

  describe('when body is a ReadableStream', () => {
    it('should respond with stream content', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        const blob = new Blob(['Hello, Hoa!'])
        ctx.res.body = blob.stream()
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(await res.text()).toBe('Hello, Hoa!')
    })
  })

  describe('when body is a URLSearchParams', () => {
    it('should respond with form-encoded content', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        const params = new URLSearchParams()
        params.append('name', 'John')
        params.append('age', '30')
        params.append('city', 'New York')
        ctx.res.body = params
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/x-www-form-urlencoded;charset=UTF-8')
      expect(await res.text()).toBe('name=John&age=30&city=New+York')
    })

    it('should handle empty URLSearchParams', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new URLSearchParams()
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/x-www-form-urlencoded;charset=UTF-8')
      expect(await res.text()).toBe('')
    })

    it('should handle special characters in URLSearchParams', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        const params = new URLSearchParams()
        params.append('message', 'Hello 世界!')
        params.append('symbols', '!@#$%^&*()')
        ctx.res.body = params
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/x-www-form-urlencoded;charset=UTF-8')
      const text = await res.text()
      expect(text).toContain('message=Hello+%E4%B8%96%E7%95%8C%21')
      expect(text).toContain('symbols=%21%40%23%24%25%5E%26*%28%29')
    })
  })

  describe('when body is a FormData', () => {
    it('should respond with multipart form data', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        const formData = new FormData()
        formData.append('username', 'john_doe')
        formData.append('email', 'john@example.com')
        formData.append('file', new Blob(['file content'], { type: 'text/plain' }), 'test.txt')
        ctx.res.body = formData
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/)

      const text = await res.text()
      expect(text).toContain('username')
      expect(text).toContain('john_doe')
      expect(text).toContain('email')
      expect(text).toContain('john@example.com')
      expect(text).toContain('test.txt')
      expect(text).toContain('file content')
    })

    it('should handle empty FormData', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new FormData()
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/)
    })

    it('should handle FormData with multiple values for same key', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        const formData = new FormData()
        formData.append('tags', 'javascript')
        formData.append('tags', 'nodejs')
        formData.append('tags', 'web')
        ctx.res.body = formData
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/)

      const text = await res.text()
      expect(text).toContain('javascript')
      expect(text).toContain('nodejs')
      expect(text).toContain('web')
    })
  })

  describe('when body is a ArrayBuffer', () => {
    it('should respond with binary data', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        const buffer = new TextEncoder().encode('Hello, Hoa!').buffer
        ctx.res.body = buffer
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/octet-stream')
      expect(await res.text()).toBe('Hello, Hoa!')
    })

    it('should handle empty ArrayBuffer', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new ArrayBuffer(0)
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/octet-stream')
      expect(await res.text()).toBe('')
    })

    it('should handle large ArrayBuffer', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        const size = 1024
        const buffer = new ArrayBuffer(size)
        const view = new Uint8Array(buffer)
        for (let i = 0; i < size; i++) {
          view[i] = i % 256
        }
        ctx.res.body = buffer
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/octet-stream')

      const arrayBuffer = await res.arrayBuffer()
      expect(arrayBuffer.byteLength).toBe(1024)
    })
  })

  describe('when body is a TypedArray', () => {
    it('should respond with Uint8Array data', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new TextEncoder().encode('Hello, Hoa!')
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/octet-stream')
      expect(await res.text()).toBe('Hello, Hoa!')
    })

    it('should handle different TypedArray types', async () => {
      const app = new Hoa()

      app.use(async (ctx, next) => {
        const path = new URL(ctx.req.url).pathname

        if (path === '/uint16') {
          ctx.res.body = new Uint16Array([1, 2, 3])
        } else if (path === '/uint32') {
          ctx.res.body = new Uint32Array([100, 200])
        } else if (path === '/float32') {
          ctx.res.body = new Float32Array([1.5, 2.5, 3.5])
        } else {
          await next()
        }
      })

      const res16 = await app.fetch(new Request('https://example.com/uint16'))
      expect(res16.status).toBe(200)
      expect(res16.headers.get('content-type')).toBe('application/octet-stream')

      const buffer16 = await res16.arrayBuffer()
      const view16 = new Uint16Array(buffer16)
      expect(view16[0]).toBe(1)
      expect(view16[1]).toBe(2)
      expect(view16[2]).toBe(3)

      const res32 = await app.fetch(new Request('https://example.com/uint32'))
      expect(res32.status).toBe(200)
      expect(res32.headers.get('content-type')).toBe('application/octet-stream')

      const buffer32 = await res32.arrayBuffer()
      const view32 = new Uint32Array(buffer32)
      expect(view32[0]).toBe(100)
      expect(view32[1]).toBe(200)

      const resFloat = await app.fetch(new Request('https://example.com/float32'))
      expect(resFloat.status).toBe(200)
      expect(resFloat.headers.get('content-type')).toBe('application/octet-stream')

      const floatBuffer = await resFloat.arrayBuffer()
      const floatView = new Float32Array(floatBuffer)
      expect(floatView[0]).toBeCloseTo(1.5)
      expect(floatView[1]).toBeCloseTo(2.5)
      expect(floatView[2]).toBeCloseTo(3.5)
    })

    it('should handle empty TypedArray', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new Uint8Array(0)
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/octet-stream')
      expect(await res.text()).toBe('')
    })

    it('should handle TypedArray with binary data', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/octet-stream')

      const arrayBuffer = await res.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      expect(uint8Array[0]).toBe(0x89)
      expect(uint8Array[1]).toBe(0x50)
      expect(uint8Array[7]).toBe(0x0A)
    })
  })

  describe('when body is a Response', () => {
    it('should inherit status and headers from Response', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.body = new Response('Hello, Hoa!', {
          status: 201,
          headers: { 'X-Bar': 'bar' }
        })
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(201)
      expect(res.headers.get('x-bar')).toBe('bar')
      expect(await res.text()).toBe('Hello, Hoa!')
    })
  })

  describe('status and body interactions', () => {
    it('should allow changing status after setting body', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.status = 304
        ctx.res.body = 'Hello, Hoa!'
        ctx.res.status = 200
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(await res.text()).toBe('Hello, Hoa!')
    })

    it('should clear content-type for 204 status', async () => {
      const app = new Hoa()

      app.use(async (ctx) => {
        ctx.res.status = 200
        ctx.res.body = 'Hello, Hoa!'
        ctx.res.set('content-type', 'text/plain')
        ctx.res.status = 204
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(204)
      expect(res.headers.get('content-type')).toBeNull()
    })
  })
})
