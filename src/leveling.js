/* Keilrechnung der Camper Card. Reine Mathematik, ohne Home Assistant und ohne DOM, damit sie getestet werden kann. */

export const DEG = Math.PI / 180;

/**
 * Berechnet, wie viele Zentimeter Keil unter welche Räder müssen.
 * Vorzeichen: pitch > 0 heißt Bug oder Front hoch, roll > 0 heißt rechte Seite hoch (in Fahrtrichtung).
 * Wohnwagen (kind 'caravan'): Keil unter die tiefe Seite, Bugrad hoch oder runter.
 * Wohnmobil und Van (kind 'wheels'): jedes Rad relativ zum höchsten Rad.
 * Werte innerhalb der Toleranz (Grad) gelten als waagerecht.
 */
export function calcLeveling({ kind, pitch = 0, roll = 0, track, base, tol = 0 }) {
  const p = Math.abs(pitch) <= tol ? 0 : pitch;
  const r = Math.abs(roll) <= tol ? 0 : roll;
  const tp = Math.tan(p * DEG), tr = Math.tan(r * DEG);
  if (kind === 'caravan') {
    return {
      kind, level: p === 0 && r === 0,
      side: r === 0 ? null : (r > 0 ? 'left' : 'right'), wedge: track * Math.abs(tr),
      nose: p === 0 ? null : (p > 0 ? 'lower' : 'raise'), noseCm: base * Math.abs(tp),
    };
  }
  const pos = { fl: [base / 2, -track / 2], fr: [base / 2, track / 2], rl: [-base / 2, -track / 2], rr: [-base / 2, track / 2] };
  const z = {};
  for (const k in pos) z[k] = pos[k][0] * tp + pos[k][1] * tr;
  const top = Math.max(...Object.values(z));
  const wheels = {};
  for (const k in z) wheels[k] = top - z[k];
  return { kind, level: p === 0 && r === 0, wheels };
}

/** Rundet auf halbe Zentimeter, so wie die Karte Keile anzeigt. */
export const round5 = (v) => Math.round(v * 2) / 2;

/** Nächstgelegene Keilstufe. Gibt null zurück, wenn keine Stufen eingetragen sind. */
export function nearestStep(v, steps) {
  if (!steps || !steps.length) return null;
  let bi = 0;
  steps.forEach((s, i) => { if (Math.abs(s - v) < Math.abs(steps[bi] - v)) bi = i; });
  return { index: bi + 1, value: steps[bi] };
}

/** Rechnet Neigungswerte in Grad um. Unterstützt °, %, rad und mrad. */
export function toDegrees(value, unit) {
  const u = String(unit || '°').trim().toLowerCase();
  if (u === '%') return Math.atan(value / 100) / DEG;
  if (u === 'rad') return value / DEG;
  if (u === 'mrad') return value / 1000 / DEG;
  return value;
}

/**
 * Wendet Achsentausch, Vorzeichen und Nullpunkt auf die Rohwerte der Sensoren an (alles in Grad).
 * Reihenfolge: erst tauschen, dann umkehren, dann Nullpunkt abziehen.
 */
export function correctTilt(raw, lv) {
  let a = raw.pitch, b = raw.roll;
  if (lv.swap_axes) [a, b] = [b, a];
  return {
    pitch: a * (lv.invert_pitch ? -1 : 1) - (lv.offset_pitch || 0),
    roll: b * (lv.invert_roll ? -1 : 1) - (lv.offset_roll || 0),
  };
}
