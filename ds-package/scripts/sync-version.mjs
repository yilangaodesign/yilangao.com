/**
 * Reads the Élan release version from elan.json and writes it into
 * ds-package/package.json. Used in CI before `npm publish`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const elan = JSON.parse(readFileSync(join(ROOT, "elan.json"), "utf-8"));
const version = elan.release.version;

const pkgPath = join(import.meta.dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
pkg.version = version;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`Synced ds-package version to ${version}`);
