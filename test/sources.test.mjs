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

import { batteryHours } from '../src/sources.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} ≈ ${b}`);

test('Restlaufzeit: Entladen mit Watt bis leer', () => {
  const r = batteryHours(50, -64, 'W', 100, 12.8); // 640 Wh übrig, 64 W
  assert.equal(r.charging, false);
  near(r.hours, 10);
});
test('Restlaufzeit: Laden bis voll', () => {
  const r = batteryHours(80, 128, 'W', 100, 12.8); // 256 Wh fehlen, 128 W
  assert.equal(r.charging, true);
  near(r.hours, 2);
});
test('Restlaufzeit: Strom in A und Leistung in kW', () => {
  near(batteryHours(50, -5, 'A', 100, 12.8).hours, 10);
  near(batteryHours(50, -0.064, 'kW', 100, 12.8).hours, 10);
  near(batteryHours(50, -5000, 'mA', 100, 12.8).hours, 10);
});
test('Restlaufzeit: keine Angabe ohne Kapazität, in Ruhe, wenn voll oder ohne Werte', () => {
  assert.equal(batteryHours(50, -64, 'W', null, 12.8), null);
  assert.equal(batteryHours(50, 3, 'W', 100, 12.8), null);
  assert.equal(batteryHours(99.5, 40, 'W', 100, 12.8), null);
  assert.equal(batteryHours(NaN, -40, 'W', 100, 12.8), null);
  assert.equal(batteryHours(50, 0.3, 'A', 100, 12.8), null); // 3,8 W gilt als Ruhe
});
