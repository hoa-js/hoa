import Hoa from '../../src/application.js'

/**
 * Simple EJS-like template engine for testing purposes
 */
const templates = {
  'user.ejs': '<h1>Hello <%= name %>!</h1><p>Age: <%- age %></p>'
}

async function render (templateName, data = {}) {
  const template = templates[templateName]
  if (!template) {
    throw new Error(`Template ${templateName} not found`)
  }

  let html = template

  html = html.replace(/<%=\s*(\w+)\s*%>/g, (match, varName) => {
    return data[varName] || ''
  })

  html = html.replace(/<%-\s*(\w+)\s*%>/g, (match, varName) => {
    return data[varName] || ''
  })

  return html
}

function hoaEjs () {
  return function hoaEjsExtension (app) {
    app.HoaContext.prototype.render = render
    app.HoaRequest.prototype.render = render
    app.HoaResponse.prototype.render = render
  }
}

describe('app.extend(fn)', () => {
  it('should throw when non-function is passed to extend()', () => {
    const app = new Hoa()
    const invalidValues = [null, undefined, 0, false, 'str', {}, []]
    invalidValues.forEach(v => {
      expect(() => app.extend(v)).toThrow('extend() must receive a function!')
    })
  })

  describe('ctx.render', () => {
    it('should add render method to ctx', async () => {
      const app = new Hoa()
      app.extend(hoaEjs())
      app.use(async (ctx) => {
        ctx.type = 'html'
        ctx.res.body = await ctx.render('user.ejs', {
          name: 'John Doe',
          age: 30
        })
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/html;charset=UTF-8')

      const html = await res.text()
      expect(html).toBe('<h1>Hello John Doe!</h1><p>Age: 30</p>')
    })

    it('should handle template errors gracefully', async () => {
      const app = new Hoa()
      app.extend(hoaEjs())
      app.use(async (ctx) => {
        try {
          await ctx.render('nonexistent.ejs')
        } catch (err) {
          ctx.res.status = 404
          ctx.res.body = `Template error: ${err.message}`
        }
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(404)
      expect(await res.text()).toBe('Template error: Template nonexistent.ejs not found')
    })
  })

  describe('ctx.req.render', () => {
    it('should add render method to ctx.req', async () => {
      const app = new Hoa()
      app.extend(hoaEjs())
      app.use(async (ctx) => {
        ctx.type = 'html'
        ctx.res.body = await ctx.req.render('user.ejs', {
          name: 'John Doe',
          age: 30
        })
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/html;charset=UTF-8')

      const html = await res.text()
      expect(html).toBe('<h1>Hello John Doe!</h1><p>Age: 30</p>')
    })

    it('should handle template errors gracefully', async () => {
      const app = new Hoa()
      app.extend(hoaEjs())
      app.use(async (ctx) => {
        try {
          await ctx.req.render('nonexistent.ejs')
        } catch (err) {
          ctx.res.status = 404
          ctx.res.body = `Template error: ${err.message}`
        }
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(404)
      expect(await res.text()).toBe('Template error: Template nonexistent.ejs not found')
    })
  })

  describe('ctx.res.render', () => {
    it('should add render method to ctx.res', async () => {
      const app = new Hoa()
      app.extend(hoaEjs())
      app.use(async (ctx) => {
        ctx.type = 'html'
        ctx.res.body = await ctx.res.render('user.ejs', {
          name: 'John Doe',
          age: 30
        })
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/html;charset=UTF-8')

      const html = await res.text()
      expect(html).toBe('<h1>Hello John Doe!</h1><p>Age: 30</p>')
    })

    it('should handle template errors gracefully', async () => {
      const app = new Hoa()
      app.extend(hoaEjs())
      app.use(async (ctx) => {
        try {
          await ctx.res.render('nonexistent.ejs')
        } catch (err) {
          ctx.res.status = 404
          ctx.res.body = `Template error: ${err.message}`
        }
      })

      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.status).toBe(404)
      expect(await res.text()).toBe('Template error: Template nonexistent.ejs not found')
    })
  })
})
