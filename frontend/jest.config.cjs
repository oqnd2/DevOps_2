module.exports = {
    setupFiles: ['./setupTest.js'],
    transform: {
        "^.+\\.jsx?$": "babel-jest"
    },
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-stub',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!axios)', // Permitir la transformación de axios
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
