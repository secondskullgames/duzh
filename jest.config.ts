export default {
  clearMocks: true,
  // collectCoverage: false,
  collectCoverageFrom: ['src/{lib,main}/**/*.ts'],
  // coverageDirectory: undefined,
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],
  coverageProvider: 'v8',
  coverageReporters: ['json', 'text-summary', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      statements: 14.0,
      branches: 40.0,
      functions: 13.0,
      lines: 14.0
    }
  },
  // dependencyExtractor: undefined,
  // errorOnDeprecated: false,
  // fakeTimers: {
  //   "enableGlobally": false
  // },
  // forceCoverageMatch: [],
  // globalSetup: undefined,
  // globalTeardown: undefined,
  // globals: {},
  // maxWorkers: "50%",
  // moduleDirectories: [
  //   "node_modules"
  // ],
  // moduleFileExtensions: [
  //   "js",
  //   "mjs",
  //   "cjs",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "json",
  //   "node"
  // ],
  moduleNameMapper: {
    '^@data/(.*)$': '<rootDir>/data/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1'
  },
  // modulePathIgnorePatterns: [],
  // notify: false,
  // notifyMode: "failure-change",
  preset: 'ts-jest',
  // projects: undefined,
  // reporters: undefined,
  // resetMocks: false,
  // resetModules: false,
  // resolver: undefined,
  // restoreMocks: false,
  // rootDir: undefined,
  // roots: [
  //   "<rootDir>"
  // ],
  // runner: "jest-runner",
  setupFiles: ['reflect-metadata']
  // setupFilesAfterEnv: [],
  // slowTestThreshold: 5,
  // snapshotSerializers: [],
  // testEnvironment: "jest-environment-node",
  // testEnvironmentOptions: {},
  // testLocationInResults: false,
  // testMatch: [
  //   "**/__tests__/**/*.[jt]s?(x)",
  //   "**/?(*.)+(spec|test).[tj]s?(x)"
  // ],
  // testPathIgnorePatterns: [
  //   "/node_modules/"
  // ],
  // testRegex: [],

  // This option allows the use of a custom results processor
  // testResultsProcessor: undefined,

  // This option allows use of a custom test runner
  // testRunner: "jest-circus/runner",

  // A map from regular expressions to paths to transformers
  // transform: undefined,

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  // transformIgnorePatterns: [
  //   "/node_modules/",
  //   "\\.pnp\\.[^\\/]+$"
  // ],

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  // unmockedModulePathPatterns: undefined,

  // Indicates whether each individual test should be reported during the run
  // verbose: undefined,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],

  // Whether to use watchman for file crawling
  // watchman: true,
};
