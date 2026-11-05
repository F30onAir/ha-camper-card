import test from 'node:test';
import assert from 'node:assert/strict';
import { chargeSources, sourceKey } from '../src/sources.js';

const ok = { power: 'ok', solar: 'ok', charger: 'ok', chargerPower: 'ok' };
const run = (v, st = ok, min = 10) => sourceKey(chargeSources(st, v, min));

test('Nur Solar lädt', () => assert.equal(run({ power: 145, solar: 210, charger: false, chargerPower: 0 }), 'solar'));
test('Nur Ladegerät lädt', () => assert.equal(run({ power: 180, solar: 0, charger: true, chargerPower: 215 }), 'charger'));
test('Beide laden', () => assert.equal(run({ power: 260, solar: 150, charger: true, chargerPower: 140 }), 'both'));
test('Laden ohne aktive Quelle: Quelle unbekannt', () => assert.equal(run({ power: 60, solar: 0, charger: false, chargerPower: 0 }), 'unknown'));
test('Entladen trotz Sonne: keine Quelle zur Batterie', () => assert.equal(run({ power: -42, solar: 210, charger: false, chargerPower: 0 }), ''));
test('Ladegerät an, aber unter der Schwelle: lädt nicht', () => {
  const s = chargeSources(ok, { power: 2, solar: 0, charger: true, chargerPower: 4 }, 10);
  assert.equal(s.chargerActive, false);
  assert.equal(s.batCharging, false);
});
test('Schwelle ist einstellbar', () => {
  assert.equal(run({ power: 30, solar: 0, charger: true, chargerPower: 8 }, ok, 10), 'unknown');
  assert.equal(run({ power: 30, solar: 0, charger: true, chargerPower: 8 }, ok, 5), 'charger');
});
test('Schalter aus, Stecker meldet noch Leistung: zählt nicht', () => {
  assert.equal(run({ power: 30, solar: 0, charger: false, chargerPower: 50 }), 'unknown');
});
test('Nur Schalter zugewiesen: an heißt lädt', () => {
  assert.equal(run({ power: 30, solar: 0, charger: true }, { ...ok, chargerPower: 'none' }), 'charger');
});
test('Nur Leistung zugewiesen: reicht allein', () => {
  assert.equal(run({ power: 30, solar: 0, chargerPower: 120 }, { ...ok, charger: 'none' }), 'charger');
});
test('Batterieleistung offline: keine Aussage über das Laden', () => {
  const s = chargeSources({ ...ok, power: 'off' }, { solar: 300, charger: true, chargerPower: 200 }, 10);
  assert.equal(s.batCharging, false);
  assert.equal(sourceKey(s), '');
});
test('Keine Quelle zugewiesen: nur „lädt“, kein „unbekannt“', () => {
  const s = chargeSources({ power: 'ok', solar: 'none', charger: 'none', chargerPower: 'none' }, { power: 50 }, 10);
  assert.equal(s.batCharging, true);
  assert.equal(s.unknown, false);
  assert.equal(s.charger, 'none');
});
test('Ladegerät komplett offline', () => {
  const s = chargeSources({ ...ok, charger: 'off', chargerPower: 'off' }, { power: 50, solar: 0 }, 10);
  assert.equal(s.charger, 'off');
  assert.equal(s.chargerActive, false);
});
