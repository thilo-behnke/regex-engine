/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "@model/(.*)": "<rootDir>/src/model/$1",
    "@utils/(.*)": "<rootDir>/src/utils/$1"
  }
};
