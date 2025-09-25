export default {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/__test__/**/*.test.js'
  ],

  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**'
  ],

  // Module resolution - correct property name
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // Transform settings for ESM - disable transforms for pure ESM
  transform: {},

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__test__/setup.js'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // ESM support
  globals: {
    jest: {
      useESM: true
    }
  }
}
