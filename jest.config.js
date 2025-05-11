/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': 'ts-jest' },
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/?(*.)+(test).ts'], // Only .test.ts files
  testPathIgnorePatterns: ['/node_modules/', '/dist/'], // Ignore compiled files
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: 'coverage',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
