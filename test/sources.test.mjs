import test from 'node:test';
import assert from 'node:assert/strict';
import { chargeSources, sourceKey, solarTotal, toW, inW } from '../src/sources.js';

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

test('0.5: Zwei Solarquellen werden in W addiert, offline zählt nicht', () => {
  assert.deepEqual(solarTotal([]), { st: 'none', w: 0 });
  assert.deepEqual(solarTotal([{ st: 'ok', v: 210, unit: 'W' }]), { st: 'ok', w: 210 });
  assert.deepEqual(solarTotal([{ st: 'ok', v: 210, unit: 'W' }, { st: 'ok', v: 0.095, unit: 'kW' }]), { st: 'ok', w: 305 });
  assert.deepEqual(solarTotal([{ st: 'off' }, { st: 'ok', v: 95, unit: 'W' }]), { st: 'ok', w: 95 });
  assert.deepEqual(solarTotal([{ st: 'off' }, { st: 'off' }]), { st: 'off', w: 0 });
  assert.deepEqual(solarTotal([{ st: 'none' }, { st: 'ok', v: 40 }]), { st: 'ok', w: 40 });
  assert.equal(toW(1.2, 'kW'), 1200);
  assert.equal(toW(12, 'W'), 12);
  // Summe beider Quellen erkennt Solar als Ladequelle, auch wenn jede allein unter 5 W liegt
  const w = solarTotal([{ st: 'ok', v: 4, unit: 'W' }, { st: 'ok', v: 4, unit: 'W' }]).w;
  assert.equal(sourceKey(chargeSources({ power: 'ok', solar: 'ok', charger: 'none', chargerPower: 'none' }, { power: 7, solar: w }, 10)), 'solar');
});

test('0.5.1: Leistung in kW wird beim Einlesen zu W (PR #8)', () => {
  assert.deepEqual(inW('power', 0.145, 'kW'), [145, 'W']);
  assert.deepEqual(inW('chargerPower', 0.3, ' kW '), [300, 'W']);
  assert.deepEqual(inW('solar2', 0.095, 'kW'), [95, 'W']);
  assert.deepEqual(inW('power', 12, 'A'), [12, 'A']); // Strom bleibt Strom
  assert.deepEqual(inW('fresh', 2, 'kW'), [2, 'kW']); // nur Leistungssensoren
  const [pw] = inW('power', 0.145, 'kW'), [cp] = inW('chargerPower', 0.3, 'kW');
  const s = chargeSources({ power: 'ok', solar: 'none', charger: 'none', chargerPower: 'ok' }, { power: pw, chargerPower: cp }, 10);
  assert.equal(s.batCharging, true);
  assert.equal(sourceKey(s), 'charger');
});

test('0.5.1: Offline-Messung des Ladegeräts bestätigt kein Laden (PR #11)', () => {
  // Messung offline, Schalter an, Solar liefert: nur Solar, nicht „beide“
  assert.equal(sourceKey(chargeSources({ ...ok, chargerPower: 'off' }, { power: 120, solar: 200, charger: true }, 10)), 'solar');
  // Messung offline, Schalter an, kein Solar: unbekannt statt Ladegerät
  assert.equal(sourceKey(chargeSources({ ...ok, solar: 'none', chargerPower: 'off' }, { power: 120, charger: true }, 10)), 'unknown');
  // Schalter offline, Messung zeigt Leistung: ebenfalls nicht bestätigt
  assert.equal(chargeSources({ ...ok, charger: 'off' }, { power: 120, solar: 0, chargerPower: 300 }, 10).chargerActive, false);
  // Nur einer zugewiesen: der entscheidet weiter allein
  assert.equal(chargeSources({ ...ok, chargerPower: 'none' }, { power: 120, solar: 0, charger: true }, 10).chargerActive, true);
  assert.equal(chargeSources({ ...ok, charger: 'none' }, { power: 120, solar: 0, chargerPower: 300 }, 10).chargerActive, true);
});

test('0.5.1: Leere Batterie beim Entladen zeigt keine Restlaufzeit (PR #14)', () => {
  assert.equal(batteryHours(0, -40, 'W', 100, 12.8), null);
  assert.equal(batteryHours(-2, -40, 'W', 100, 12.8), null);
  assert.equal(batteryHours(0, 40, 'W', 100, 12.8).charging, true); // Laden ab 0 % geht weiter
  assert.ok(batteryHours(1, -40, 'W', 100, 12.8).hours > 0);
});
