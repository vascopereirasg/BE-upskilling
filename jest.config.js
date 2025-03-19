module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/*.test.ts"],
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "d.ts"],
    setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/tests/**/*.{ts,tsx}", "!src/types/**/*.{ts,tsx}", "!src/**/*.d.ts"],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  }
  
  