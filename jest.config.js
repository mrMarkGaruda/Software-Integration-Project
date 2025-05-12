/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': 'ts-jest' },
  testMatch: ['**/src/**/*.test.ts', '**/__tests__/**/*.test.ts'], // Updated to include both directories
};
