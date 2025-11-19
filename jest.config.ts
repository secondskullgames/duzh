export default {
  clearMocks: true,
  collectCoverageFrom: ['src/{lib,main}/**/*.ts'],
  coverageProvider: 'v8',
  coverageReporters: ['json', 'text-summary', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      statements: 17.0,
      branches: 46.0,
      functions: 13.0,
      lines: 17.0
    }
  },
  moduleNameMapper: {
    '^@data/(.*)$': '<rootDir>/data/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1'
  },
  preset: 'ts-jest'
};
