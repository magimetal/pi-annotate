import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function run(command, args, options = {}) {
	return execFileSync(command, args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
		...options,
	}).trim();
}

function makeTempDir(prefix) {
	return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

const cwd = process.cwd();
const packJson = run("npm", ["pack", "--json"], { cwd });
const pack = JSON.parse(packJson);
const tarball = pack[0]?.filename;

if (!tarball) {
	throw new Error("npm pack did not return tarball filename");
}

const artifactDir = makeTempDir("pi-annotate-artifact-");
const homeDir = makeTempDir("pi-annotate-home-");
const projectDir = makeTempDir("pi-annotate-project-");
const packagePath = path.join(artifactDir, "node_modules", "pi-annotate");
const env = {
	...process.env,
	HOME: homeDir,
};

run("npm", ["install", "--prefix", artifactDir, path.join(cwd, tarball)], {
	cwd,
});
run("npx", ["pi", "install", "-l", packagePath], { cwd: projectDir, env });

const settingsPath = path.join(projectDir, ".pi", "settings.json");
if (!fs.existsSync(settingsPath)) {
	throw new Error(`Project settings not created at ${settingsPath}`);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
const registeredPackages = Array.isArray(settings.packages)
	? settings.packages.map((entry) =>
			path.resolve(path.dirname(settingsPath), entry),
		)
	: [];
if (!registeredPackages.includes(packagePath)) {
	throw new Error(
		`Project settings did not register package path: ${packagePath}`,
	);
}

const listOutput = run("npx", ["pi", "list"], { cwd: projectDir, env });
const configOutput = run("npx", ["pi", "config"], { cwd: projectDir, env });

if (!listOutput.includes("pi-annotate") && !listOutput.includes(packagePath)) {
	throw new Error(`pi list did not show pi-annotate. Output:\n${listOutput}`);
}

if (
	!configOutput.includes("annotate") &&
	!configOutput.includes("pi-annotate")
) {
	throw new Error(
		`pi config did not show annotate visibility. Output:\n${configOutput}`,
	);
}

console.log(`Packed artifact install verified: ${tarball}`);
console.log(`Project settings: ${settingsPath}`);
console.log(registeredPackages.join("\n"));
console.log("--- pi list ---");
console.log(listOutput);
console.log("--- pi config ---");
console.log(configOutput);
