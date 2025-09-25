import Hoa from '../../src/application.js'

describe('app.toJSON()', () => {
  it('should return app name', () => {
    const app = new Hoa({ name: 'TestApp' })
    const obj = app.toJSON()

    expect(obj).toEqual({
      name: 'TestApp'
    })
  })

  it('should return default name when not specified', () => {
    const app = new Hoa()
    const obj = app.toJSON()

    expect(obj).toEqual({
      name: 'Hoa'
    })
  })
})
