module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'controllers/**/*.js',
      'models/**/*.js',
      'routes/**/*.js',
      'utils/**/*.js',
      '!**/node_modules/**',
      '!**/coverage/**',
      '!**/__tests__/**'
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    verbose: true,
    testTimeout: 10000,
    setupFilesAfterEnv: ['./__tests__/setup.js']
  };