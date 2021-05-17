const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/server",
    devtool: "inline-source-map",
    target: "node",
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        path: path.join(__dirname, "/dist/"),
        filename: "server.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    }
};