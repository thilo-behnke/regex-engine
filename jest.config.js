/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    "@model/(.*)": "<rootDir>/model/$1",
    "@utils/(.*)": "<rootDir>/utils/$1"
  }
};
