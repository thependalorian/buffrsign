const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
    '^.+\.(js|jsx)$': 'babel-jest',
    '^.+\.mjs$': 'babel-jest', // Add this line for .mjs files
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
    '!**/__tests__/api-routes.test.ts',
    '!**/__tests__/test-runner.ts'
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  // transformIgnorePatterns: [
  //   '/node_modules/(?!(jose|next)/)' // Include 'jose' and 'next' modules for transformation
  // ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'], // Keep this
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^jose$': '<rootDir>/__mocks__/jose.js',
  },
  testTimeout: 10000,
}

module.exports = createJestConfig(customJestConfig)