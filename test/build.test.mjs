import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('Build: eine einzelne Datei mit beiden Elementen, ohne import/export', () => {
  execFileSync(process.execPath, [join(root, 'scripts', 'build.mjs')]);
  const out = readFileSync(join(root, 'dist', 'camper-card.js'), 'utf8');
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.match(out, /customElements\.define\('camper-card', CamperCard\)/);
  assert.match(out, /customElements\.define\('camper-card-editor', CamperCardEditor\)/);
  assert.doesNotMatch(out, /^\s*(import|export)\s/m);
  assert.ok(out.includes(JSON.stringify(pkg.version)), 'Version eingetragen');
  assert.ok(!out.includes('__VERSION__'), 'Platzhalter ersetzt');
  assert.ok(Buffer.byteLength(out) < 128 * 1024, 'passt als eingebettete Ressource (unter 128 KB)');
  assert.doesNotMatch(out, /https?:\/\/(?!www\.w3\.org)/, 'lädt nichts aus dem Internet');
});
