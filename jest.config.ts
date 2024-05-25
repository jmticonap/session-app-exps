/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
const baseDir = '<rootDir>/src/app/server_app';
const baseTestDir = '<rootDir>/test';

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    collectCoverageFrom: [
        `${baseDir}/**/*.ts`
    ],
    testMatch: [`${baseTestDir}/**/*.test.ts`],
};
