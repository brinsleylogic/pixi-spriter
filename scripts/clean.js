const { resolve } = require("path");
const { sync } = require("rimraf");

console.log("Cleaning last build.");

sync(resolve(process.cwd(), "dist"));
sync(resolve(process.cwd(), "*.tsbuildinfo"));

console.log("Clean complete.");