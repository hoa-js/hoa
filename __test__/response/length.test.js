import Hoa from '../../src/hoa.js'

describe('res.length', () => {
  describe('get length', () => {
    it('should return parsed Content-Length header when present', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.set('Content-Length', '123')
      expect(ctx.res.length).toBe(123)

      ctx.res.set('Content-Length', '0')
      expect(ctx.res.length).toBe(0)
    })

    it('should return 0 for invalid Content-Length header', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.set('Content-Length', 'invalid')
      expect(ctx.res.length).toBe(0)

      ctx.res.set('Content-Length', '')
      expect(ctx.res.length).toBe(0)
    })

    it('should calculate length for string body', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.body = 'Hello, Hoa!'
      expect(ctx.res.length).toBe(11)

      ctx.res.body = 'Hello, 世界!'
      expect(ctx.res.length).toBe(14) // UTF-8 bytes

      ctx.res.body = ''
      expect(ctx.res.length).toBe(0)
    })

    it('should calculate length for Blob body', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.body = new Blob(['Hello, Hoa!'], { type: 'text/plain' })
      expect(ctx.res.length).toBe(11)

      ctx.res.body = new Blob([''], { type: 'text/plain' })
      expect(ctx.res.length).toBe(0)
    })

    it('should calculate length for ArrayBuffer body', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      const buffer = new ArrayBuffer(16)
      ctx.res.body = buffer
      expect(ctx.res.length).toBe(16)

      const emptyBuffer = new ArrayBuffer(0)
      ctx.res.body = emptyBuffer
      expect(ctx.res.length).toBe(0)
    })

    it('should calculate length for TypedArray body', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      const uint8Array = new Uint8Array([1, 2, 3, 4, 5])
      ctx.res.body = uint8Array
      expect(ctx.res.length).toBe(5)

      const uint16Array = new Uint16Array([1, 2, 3])
      ctx.res.body = uint16Array
      expect(ctx.res.length).toBe(6) // 3 * 2 bytes

      const emptyArray = new Uint8Array(0)
      ctx.res.body = emptyArray
      expect(ctx.res.length).toBe(0)
    })

    it('should calculate length for URLSearchParams body', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      const params = new URLSearchParams('name=John&age=30')
      ctx.res.body = params
      expect(ctx.res.length).toBe(16) // "name=John&age=30"

      const emptyParams = new URLSearchParams()
      ctx.res.body = emptyParams
      expect(ctx.res.length).toBe(0)
    })

    it('should calculate length for JSON object body', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.body = { name: 'John', age: 30 }
      const jsonString = JSON.stringify({ name: 'John', age: 30 })
      const expectedLength = new TextEncoder().encode(jsonString).length
      expect(ctx.res.length).toBe(expectedLength)

      ctx.res.body = {}
      expect(ctx.res.length).toBe(2) // "{}"

      ctx.res.body = []
      expect(ctx.res.length).toBe(2) // "[]"
    })

    it('should return null for undeterminable body types', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.body = null
      expect(ctx.res.length).toBeNull()

      ctx.res.body = undefined
      expect(ctx.res.length).toBeNull()

      const stream = new ReadableStream()
      ctx.res.body = stream
      expect(ctx.res.length).toBeNull()

      const formData = new FormData()
      formData.append('key', 'value')
      ctx.res.body = formData
      expect(ctx.res.length).toBeNull()

      const response = new Response('test')
      ctx.res.body = response
      expect(ctx.res.length).toBeNull()
    })

    it('should prioritize Content-Length header over body calculation', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.body = 'Hello, Hoa!' // 11 bytes
      ctx.res.set('Content-Length', '100') // Override
      expect(ctx.res.length).toBe(100)
    })
  })

  describe('set length', () => {
    it('should set Content-Length header', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.length = 123
      expect(ctx.res.get('Content-Length')).toBe('123')

      ctx.res.length = 0
      expect(ctx.res.get('Content-Length')).toBe('0')
    })

    it('should accept string values', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.length = '456'
      expect(ctx.res.get('Content-Length')).toBe('456')
    })

    it('should not set Content-Length when Transfer-Encoding is present', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.set('Transfer-Encoding', 'chunked')
      ctx.res.length = 123
      expect(ctx.res.get('Content-Length')).toBeNull()
      expect(ctx.res.get('Transfer-Encoding')).toBe('chunked')
    })

    it('should override existing Content-Length when no Transfer-Encoding', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.set('Content-Length', '100')
      ctx.res.length = 200
      expect(ctx.res.get('Content-Length')).toBe('200')
    })

    it('should work with getter for round-trip', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.length = 789
      expect(ctx.res.length).toBe(789)

      ctx.res.length = '999'
      expect(ctx.res.length).toBe(999)
    })
  })

  describe('integration with body setter', () => {
    it('should work correctly with automatic content-length calculation', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      ctx.res.body = 'Hello, Hoa!'
      expect(ctx.res.length).toBe(11)

      ctx.res.length = 20
      expect(ctx.res.length).toBe(20)

      ctx.res.delete('Content-Length')
      expect(ctx.res.length).toBe(11)
    })

    it('should handle complex UTF-8 strings correctly', () => {
      const app = new Hoa()
      const request = new Request('https://example.com/')
      const ctx = app.createContext(request)

      const complexString = '🚀 Hello 世界 🌍'
      ctx.res.body = complexString
      const expectedBytes = new TextEncoder().encode(complexString).length
      expect(ctx.res.length).toBe(expectedBytes)
      expect(ctx.res.length).toBeGreaterThan(complexString.length) // More bytes than characters
    })
  })
})
