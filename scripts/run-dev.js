const path = require("path");
const { execSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
process.chdir(projectRoot);

console.log("Running dev server from:", projectRoot);
execSync("npx next dev --hostname localhost --port 3001", { stdio: "inherit" });
