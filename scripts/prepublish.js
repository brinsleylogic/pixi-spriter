const { copyFileSync, readFileSync, writeFileSync} = require("fs");
const resolve = require("path").resolve;

const cwd = process.cwd();
const file = readFileSync(resolve(cwd, "package.json"));
const json = JSON.parse(file.toString());

delete json.private;

console.log("Writing package.json to 'dist' folder.");

const targetPath = resolve(cwd, "dist");

writeFileSync(
    resolve(targetPath, "package.json"),
    JSON.stringify(json, null, { spaces: 4 }),
    "utf-8"
);

console.log("Copying README.md to 'dist' folder.");

copyFileSync(
    resolve(cwd, "README.md"),
    resolve(targetPath, "README.md")
);