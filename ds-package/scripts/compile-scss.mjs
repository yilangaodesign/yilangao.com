/**
 * Phase 1 build: compile all .module.scss files into CSS + JSON class maps.
 *
 * Sass compiles SCSS → CSS, then postcss-modules generates scoped class names
 * and writes a JSON map (e.g. Button.module.json) alongside the CSS.
 * The tsup esbuild plugin reads these during Phase 2.
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename, relative } from "node:path";
import * as sass from "sass";
import postcss from "postcss";
import postcssModules from "postcss-modules";

const UI_DIR = join(import.meta.dirname, "..", "..", "src", "components", "ui");
const OUT_DIR = join(import.meta.dirname, "..", ".build-scss");

async function findScssModules(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findScssModules(full)));
    } else if (entry.name.endsWith(".module.scss")) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = await findScssModules(UI_DIR);
  console.log(`Found ${files.length} SCSS modules to compile`);

  let allCss = "";

  for (const scssPath of files) {
    const rel = relative(UI_DIR, scssPath);
    const name = basename(scssPath, ".module.scss");

    const compiled = sass.compile(scssPath, {
      loadPaths: [
        join(import.meta.dirname, "..", "..", "src", "styles"),
        join(import.meta.dirname, "..", "..", "node_modules"),
      ],
    });

    let jsonMap = {};
    const result = await postcss([
      postcssModules({
        generateScopedName: `elan-${name}-[local]`,
        getJSON(_, json) {
          jsonMap = json;
        },
      }),
    ]).process(compiled.css, { from: scssPath });

    const outBaseName = rel.replace(/[/\\]/g, "__").replace(".module.scss", "");
    await writeFile(join(OUT_DIR, `${outBaseName}.css`), result.css);
    await writeFile(
      join(OUT_DIR, `${outBaseName}.json`),
      JSON.stringify(jsonMap, null, 2),
    );

    allCss += result.css + "\n";
  }

  await writeFile(join(OUT_DIR, "all.css"), allCss);
  console.log(`Compiled ${files.length} SCSS modules → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
