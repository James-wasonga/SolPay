/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/programs/',
      '/target/',
    ],
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
    transform: {
      '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
    },
  };