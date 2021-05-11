const { symlinkSync, existsSync } = require("fs");
const { resolve } = require("path");

const targetLoc = resolve(process.cwd(), "demo/node_modules/pixi-spriter");

if (!existsSync(targetLoc)) {
    symlinkSync(resolve(process.cwd(), "dist"), targetLoc, "dir");
}