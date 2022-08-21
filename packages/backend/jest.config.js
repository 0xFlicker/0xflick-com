const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')

// Add any custom config to be passed to Jest
/** @type { import('@jest/types').Config.InitialOptions } */
module.exports = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  setupFiles: ['<rootDir>/jest.setup.js'],
  roots: ["<rootDir>/src/"],
  "transformIgnorePatterns": [
    ".*node_modules/?!(uuid)/"
  ],
  ...require("jest-dynalite/jest-preset")
}
