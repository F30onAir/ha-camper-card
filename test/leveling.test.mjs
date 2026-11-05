import test from 'node:test';
import assert from 'node:assert/strict';
import { calcLeveling, round5, nearestStep, toDegrees, correctTilt } from '../src/leveling.js';

// Erwartete Werte unabhängig nachgerechnet (Python, math.tan), auf 0,01 cm genau.
const near = (a, b, e = 0.01) => assert.ok(Math.abs(a - b) <= e, `${a} weicht von ${b} ab`);

test('Wohnwagen: rechte Seite 1° hoch, Spur 215 cm: 3,75 cm Keil unter das linke Rad', () => {
  const r = calcLeveling({ kind: 'caravan', roll: 1, track: 215, base: 430 });
  assert.equal(r.side, 'left');
  near(r.wedge, 3.753);
  assert.equal(r.nose, null);
});

test('Wohnwagen: linke Seite 2° hoch, Spur 200 cm: 6,98 cm unter das rechte Rad', () => {
  const r = calcLeveling({ kind: 'caravan', roll: -2, track: 200, base: 430 });
  assert.equal(r.side, 'right');
  near(r.wedge, 6.984);
});

test('Wohnwagen: Bug 1° hoch, 430 cm bis Bugrad: Bug 7,51 cm absenken', () => {
  const r = calcLeveling({ kind: 'caravan', pitch: 1, track: 215, base: 430 });
  assert.equal(r.nose, 'lower');
  near(r.noseCm, 7.506);
  assert.equal(r.side, null);
});

test('Wohnwagen: Bug 2,6° tief: Bug 19,53 cm anheben', () => {
  const r = calcLeveling({ kind: 'caravan', pitch: -2.6, track: 215, base: 430 });
  assert.equal(r.nose, 'raise');
  near(r.noseCm, 19.526);
});

test('Wohnwagen: große Neigung 10° bleibt korrekt (tan statt Näherung)', () => {
  near(calcLeveling({ kind: 'caravan', roll: 10, track: 215, base: 430 }).wedge, 37.911);
});

test('Toleranz: Werte innerhalb gelten als waagerecht, keine Keile', () => {
  const r = calcLeveling({ kind: 'caravan', pitch: 0.1, roll: -0.2, track: 215, base: 430, tol: 0.2 });
  assert.equal(r.level, true);
  assert.equal(r.side, null);
  assert.equal(r.nose, null);
  const w = calcLeveling({ kind: 'wheels', pitch: 0.15, roll: 0.15, track: 180, base: 400, tol: 0.2 });
  assert.equal(w.level, true);
  for (const v of Object.values(w.wheels)) assert.equal(v, 0);
});

test('Knapp außerhalb der Toleranz wird gerechnet', () => {
  const r = calcLeveling({ kind: 'caravan', roll: 0.21, track: 215, base: 430, tol: 0.2 });
  assert.equal(r.level, false);
  assert.equal(r.side, 'left');
});

test('Wohnmobil: vorn 1° hoch und rechts 1° hoch, Radstand 400, Spur 180', () => {
  const r = calcLeveling({ kind: 'wheels', pitch: 1, roll: 1, track: 180, base: 400 });
  near(r.wheels.fr, 0);
  near(r.wheels.fl, 3.142);
  near(r.wheels.rr, 6.982);
  near(r.wheels.rl, 10.124);
});

test('Van: vorn 1,5° tief, Radstand 345: beide Vorderräder 9,03 cm, hinten 0', () => {
  const r = calcLeveling({ kind: 'wheels', pitch: -1.5, roll: 0, track: 170, base: 345 });
  near(r.wheels.fl, 9.034);
  near(r.wheels.fr, 9.034);
  near(r.wheels.rl, 0);
  near(r.wheels.rr, 0);
});

test('Räder: das höchste Rad hat immer 0, kein Wert ist negativ', () => {
  for (const [p, r] of [[2, -1], [-3, 2], [0.7, 0.7], [-1, -4]]) {
    const w = calcLeveling({ kind: 'wheels', pitch: p, roll: r, track: 180, base: 400 }).wheels;
    const vals = Object.values(w);
    near(Math.min(...vals), 0, 1e-9);
    for (const v of vals) assert.ok(v >= -1e-9);
  }
});

test('Spiegelbild: gleiche Neigung nach links und rechts ergibt gleiche Keilhöhe', () => {
  const a = calcLeveling({ kind: 'caravan', roll: 1.7, track: 210, base: 400 });
  const b = calcLeveling({ kind: 'caravan', roll: -1.7, track: 210, base: 400 });
  near(a.wedge, b.wedge, 1e-9);
  assert.notEqual(a.side, b.side);
});

test('Runden auf halbe Zentimeter', () => {
  assert.equal(round5(3.24), 3);
  assert.equal(round5(3.26), 3.5);
  assert.equal(round5(3.75), 4);
  assert.equal(round5(0.2), 0);
});

test('Keilstufen: nächstgelegene Stufe', () => {
  assert.deepEqual(nearestStep(5.5, [3, 6, 9]), { index: 2, value: 6 });
  assert.deepEqual(nearestStep(1, [3, 6, 9]), { index: 1, value: 3 });
  assert.deepEqual(nearestStep(20, [3, 6, 9]), { index: 3, value: 9 });
  assert.equal(nearestStep(5, []), null);
});

test('Einheiten: Grad, Prozent und Radiant', () => {
  near(toDegrees(1.5, '°'), 1.5, 1e-9);
  near(toDegrees(1.5, undefined), 1.5, 1e-9);
  near(toDegrees(100, '%'), 45, 1e-9);
  near(toDegrees(Math.PI / 180, 'rad'), 1, 1e-9);
  near(toDegrees(17.4533, 'mrad'), 1, 1e-4);
});

test('Korrektur: tauschen, umkehren, Nullpunkt', () => {
  const lv = { swap_axes: false, invert_pitch: false, invert_roll: false, offset_pitch: 0, offset_roll: 0 };
  assert.deepEqual(correctTilt({ pitch: 1, roll: 2 }, lv), { pitch: 1, roll: 2 });
  assert.deepEqual(correctTilt({ pitch: 1, roll: 2 }, { ...lv, swap_axes: true }), { pitch: 2, roll: 1 });
  assert.deepEqual(correctTilt({ pitch: 1, roll: 2 }, { ...lv, invert_pitch: true }), { pitch: -1, roll: 2 });
  assert.deepEqual(correctTilt({ pitch: 1, roll: 2 }, { ...lv, offset_pitch: 1, offset_roll: 0.5 }), { pitch: 0, roll: 1.5 });
});
