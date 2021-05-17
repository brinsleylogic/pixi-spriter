const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/index",
    devtool: "inline-source-map",
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        path: path.join(__dirname, "/dist/"),
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 200,
        // poll: 1000,
    }
};