const path = require("path");
const { execSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
process.chdir(projectRoot);

console.log("Building from:", projectRoot);
execSync("npx next build", { stdio: "inherit" });
