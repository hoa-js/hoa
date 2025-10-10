import globals from 'globals'
import neostandard from 'neostandard'

export default [
  ...neostandard({
    ignores: ['dist/**', 'node_modules/**']
  }),
  {
    files: ['src/**/*.js', '__test__/**/*.js'],
    languageOptions: {
      globals: globals.jest
    }
  }
]
