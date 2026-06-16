/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/unit/setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'TaskLance E2E Test Report',
      outputPath: 'tests/e2e/artifacts/test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }],
    '<rootDir>/tests/e2e/ExcelReporter.js'
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'node',
          jsx: 'react-jsx',
          esModuleInterop: true
        }
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/tests/**/*.spec.ts', '**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  testTimeout: 60000,
};
