/* Konfiguration der Camper Card: Standardwerte und Prüfung. Ohne DOM, damit sie getestet werden kann. */
import { V, GROUPS, DIMS } from './vehicles.js';

/** Konfigurationsname der Entität und interner Schlüssel. gas_availability wird gesondert behandelt. */
export const ENTITY_KEYS = {
  battery: 'battery', battery_power: 'power', solar: 'solar', charger: 'charger', charger_power: 'chargerPower',
  fresh: 'fresh', grey: 'grey', gas: 'gas', temp_inside: 'tempIn', temp_fridge: 'tempFridge',
  pump: 'pump', light_inside: 'lightIn', light_outside: 'lightOut', pitch: 'pitch', roll: 'roll',
};
export const CFG_OF = Object.fromEntries(Object.entries(ENTITY_KEYS).map(([c, k]) => [k, c]));
export const BOOL_KEYS = new Set(['charger', 'pump', 'lightIn', 'lightOut']);
export const VEHICLES = ['caravan', 'motorhome', 'van'];

const cfgNum = (x, d) => { const n = typeof x === 'string' && x.trim() === '' ? NaN : Number(x); return Number.isFinite(n) ? n : d; };
const cfgClamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Keilstufen aus Text („3, 6, 9“), Zahl oder Liste. Ergebnis: aufsteigende positive Zahlen. */
export function parseSteps(s) {
  let arr = [];
  if (Array.isArray(s)) arr = s;
  else if (typeof s === 'number') arr = [s];
  else if (typeof s === 'string') arr = s.split(/[;,\s]+/);
  return arr.map(Number).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
}

/** Prüft die Rohkonfiguration und ergänzt Standardwerte. Wirft bei unbrauchbarer Eingabe. */
export function normalizeConfig(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Camper Card: Konfiguration fehlt / configuration missing');
  let vehicle = VEHICLES.includes(raw.vehicle) ? raw.vehicle : (raw.outline && V[raw.outline] ? V[raw.outline].type : 'caravan');
  let outline = raw.outline && V[raw.outline] && V[raw.outline].type === vehicle ? raw.outline : GROUPS[vehicle][0];
  const entities = {};
  const ent = raw.entities && typeof raw.entities === 'object' ? raw.entities : {};
  for (const key of [...Object.keys(ENTITY_KEYS), 'gas_availability']) {
    if (typeof ent[key] === 'string' && ent[key].includes('.')) entities[key] = ent[key].trim();
  }
  const lv = raw.leveling && typeof raw.leveling === 'object' ? raw.leveling : {};
  const dims = DIMS[outline];
  const track = cfgNum(lv.track, null), base = cfgNum(lv.base, null);
  return {
    type: raw.type,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : null,
    vehicle, outline,
    offline: raw.offline === 'hide' ? 'hide' : 'grey',
    language: raw.language === 'de' || raw.language === 'en' ? raw.language : 'auto',
    pump_name: typeof raw.pump_name === 'string' && raw.pump_name.trim() ? raw.pump_name.trim() : null,
    charger_min_power: Math.max(0, cfgNum(raw.charger_min_power, 10)),
    charger_toggle: raw.charger_toggle === true,
    entities,
    leveling: {
      track: track !== null && track > 0 ? track : dims[0],
      base: base !== null && base > 0 ? base : dims[1],
      defaults: !(track > 0) || !(base > 0),
      max_wedge: Math.max(0, cfgNum(lv.max_wedge, 12)),
      steps: parseSteps(lv.steps),
      tolerance: cfgClamp(cfgNum(lv.tolerance, 0.2), 0, 5),
      invert_pitch: lv.invert_pitch === true,
      invert_roll: lv.invert_roll === true,
      swap_axes: lv.swap_axes === true,
      offset_pitch: cfgNum(lv.offset_pitch, 0),
      offset_roll: cfgNum(lv.offset_roll, 0),
    },
  };
}
