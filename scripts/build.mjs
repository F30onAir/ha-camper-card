/* Baut dist/camper-card.js aus den Modulen in src/. Ohne fremde Pakete: Module werden in fester Reihenfolge
   zusammengefügt, import-Zeilen entfernt und export-Schlüsselwörter gestrichen. Ergebnis ist eine einzelne Datei,
   die Home Assistant ohne Internet laden kann. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const ORDER = ['i18n.js', 'vehicles.js', 'leveling.js', 'sources.js', 'config.js', 'card.js', 'editor.js', 'register.js'];

let out = `/*! Camper Card ${pkg.version} | Home Assistant dashboard card | outlines are generic approximations, no manufacturer drawings */\n(() => {\n'use strict';\n`;
const names = new Set();
for (const f of ORDER) {
  let src = readFileSync(join(root, 'src', f), 'utf8');
  src = src.replace(/^import\s[^;]*;\s*$/gm, '');
  src = src.replace(/^export\s+(?=(const|let|function|class|async)\b)/gm, '');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/`[\s\S]*?`|'[^'\n]*'|"[^"\n]*"/g, '""');
  if (/\b(import|export)\b/.test(code)) throw new Error(`Unbehandeltes import/export in ${f}`);
  for (const m of code.matchAll(/^(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    if (names.has(m[1])) throw new Error(`Name doppelt auf oberster Ebene: ${m[1]} (${f})`);
    names.add(m[1]);
  }
  out += `\n// ---- ${f} ----\n${src.trim()}\n`;
}
out = out.replace("'__VERSION__'", JSON.stringify(pkg.version));
out += '})();\n';
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'camper-card.js'), out);
console.log(`dist/camper-card.js: ${Buffer.byteLength(out)} Bytes, Version ${pkg.version}`);
