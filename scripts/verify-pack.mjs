import { execFileSync } from "node:child_process";

const requiredEntries = [
	"package/package.json",
	"package/README.md",
	"package/CHANGELOG.md",
	"package/LICENSE",
	"package/NOTICE.md",
	"package/extensions/annotate.ts",
	"package/extensions/annotate-core.ts",
	"package/extensions/annotate-types.ts",
	"package/chrome-extension/manifest.json",
	"package/chrome-extension/background.js",
	"package/chrome-extension/content.js",
	"package/chrome-extension/popup.html",
	"package/chrome-extension/popup.js",
	"package/chrome-extension/native/install.sh",
	"package/chrome-extension/native/host.cjs",
	"package/chrome-extension/icons/icon16.png",
	"package/chrome-extension/icons/icon48.png",
	"package/chrome-extension/icons/icon128.png",
];

const forbiddenEntries = [
	"package/index.ts",
	"package/types.ts",
	"package/chrome-extension/native/host-wrapper.sh",
	"package/tsconfig.json",
	"package/vitest.config.ts",
	"package/.gitignore",
];

function run(command, args) {
	return execFileSync(command, args, { encoding: "utf8" }).trim();
}

const packJson = run("npm", ["pack", "--json"]);
const pack = JSON.parse(packJson);
const tarball = pack[0]?.filename;

if (!tarball) {
	throw new Error("npm pack did not return tarball filename");
}

const entries = new Set(
	run("tar", ["-tf", tarball]).split("\n").filter(Boolean),
);

for (const entry of requiredEntries) {
	if (!entries.has(entry)) {
		throw new Error(`Missing required tarball entry: ${entry}`);
	}
}

for (const entry of forbiddenEntries) {
	if (entries.has(entry)) {
		throw new Error(`Forbidden tarball entry present: ${entry}`);
	}
}

for (const entry of entries) {
	if (entry.startsWith("package/docs/")) {
		throw new Error(`Forbidden docs tarball entry present: ${entry}`);
	}
	if (entry.startsWith("package/test-results/")) {
		throw new Error(`Forbidden test-results tarball entry present: ${entry}`);
	}
	if (entry.startsWith("package/tests/")) {
		throw new Error(`Forbidden tests tarball entry present: ${entry}`);
	}
	if (entry.startsWith("package/.github/")) {
		throw new Error(`Forbidden workflow tarball entry present: ${entry}`);
	}
}

console.log(`Tarball verified: ${tarball}`);
console.log([...entries].sort().join("\n"));
