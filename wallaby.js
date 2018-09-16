module.exports = (wallaby) => ({
    files: ["tsconfig.json", "src/**/*.ts?(x)"],
    tests: ["_tests/**/*.test.ts?(x)"],

    testFramework: "jest",
    env: {
        type: "node",
        runner: "node",
    },

    compilers: {
        "**/*.ts?(x)": wallaby.compilers.typeScript({
            typescript: require("typescript"),
            target: "es6",
            module: "commonjs"
        })
    }
});