/* Konfiguration der Camper Card: Standardwerte und Prüfung. Ohne DOM, damit sie getestet werden kann. */
import { V, GROUPS, DIMS } from './vehicles.js';

/** Konfigurationsname der Entität und interner Schlüssel. gas_availability und gas2_availability werden gesondert behandelt. */
export const ENTITY_KEYS = {
  battery: 'battery', battery_power: 'power', solar: 'solar', charger: 'charger', charger_power: 'chargerPower',
  fresh: 'fresh', grey: 'grey', gas: 'gas', gas2: 'gas2', temp_inside: 'tempIn', humidity_inside: 'humIn', temp_outside: 'tempOut',
  temp_fridge: 'tempFridge', temp_freezer: 'tempFreezer',
  pump: 'pump', light_inside: 'lightIn', light_outside: 'lightOut', pitch: 'pitch', roll: 'roll',
};
export const CFG_OF = Object.fromEntries(Object.entries(ENTITY_KEYS).map(([c, k]) => [k, c]));
export const BOOL_KEYS = new Set(['charger', 'pump', 'lightIn', 'lightOut']);
export const VEHICLES = ['caravan', 'motorhome', 'van'];
/** Kacheln und Schalter, deren Beschriftung man unter names: selbst setzen kann (Konfigurationsnamen). */
export const NAME_KEYS = ['battery', 'solar', 'charger', 'fresh', 'grey', 'gas', 'gas2', 'temp_inside', 'humidity_inside', 'temp_outside',
  'temp_fridge', 'temp_freezer', 'pump', 'light_inside', 'light_outside'];
/** Höchstzahl frei belegbarer Schalter (switches:). */
export const MAX_SWITCHES = 6;
const MAX_NAME = 40;

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
  for (const key of [...Object.keys(ENTITY_KEYS), 'gas_availability', 'gas2_availability']) {
    if (typeof ent[key] === 'string' && ent[key].includes('.')) entities[key] = ent[key].trim();
  }
  // Eigene Namen, intern nach Schlüssel der Karte. pump_name aus 0.1 gilt weiter, names.pump hat Vorrang.
  const names = {};
  const nm = raw.names && typeof raw.names === 'object' ? raw.names : {};
  const txt = (x) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, MAX_NAME) : null);
  for (const key of NAME_KEYS) { const n = txt(nm[key]); if (n) names[ENTITY_KEYS[key]] = n; }
  const pumpName = txt(raw.pump_name);
  if (pumpName && !names.pump) names.pump = pumpName;
  // Frei belegbare Schalter: Liste aus { entity, name, icon } oder nur der Entität als Text.
  const switches = (Array.isArray(raw.switches) ? raw.switches : []).map((s) => {
    const o = typeof s === 'string' ? { entity: s } : (s && typeof s === 'object' ? s : {});
    const entity = typeof o.entity === 'string' && o.entity.includes('.') ? o.entity.trim() : null;
    const icon = typeof o.icon === 'string' && /^[a-z]+:[a-z0-9-]+$/.test(o.icon.trim()) ? o.icon.trim() : null;
    return entity ? { entity, name: txt(o.name), icon } : null;
  }).filter(Boolean).slice(0, MAX_SWITCHES);
  const cap = cfgNum(raw.battery_capacity, 0);
  const lv = raw.leveling && typeof raw.leveling === 'object' ? raw.leveling : {};
  const dims = DIMS[outline];
  const track = cfgNum(lv.track, null), base = cfgNum(lv.base, null);
  return {
    type: raw.type,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : null,
    vehicle, outline,
    offline: raw.offline === 'hide' ? 'hide' : 'grey',
    language: raw.language === 'de' || raw.language === 'en' ? raw.language : 'auto',
    pump_name: pumpName,
    names,
    charger_min_power: Math.max(0, cfgNum(raw.charger_min_power, 10)),
    charger_toggle: raw.charger_toggle === true,
    // Restlaufzeit: Kapazität in Ah (ohne Angabe keine Restlaufzeit), Nennspannung für die Umrechnung von Watt.
    battery_capacity: cap > 0 ? cap : null,
    battery_voltage: cfgClamp(cfgNum(raw.battery_voltage, 12.8), 6, 60),
    // Frostwarnung in °C, gilt für Tanks mit Wasser. Abschalten mit frost_warning: false.
    frost_warning: raw.frost_warning !== false,
    frost_temp: cfgClamp(cfgNum(raw.frost_temp, 3), -10, 10),
    humidity_max: cfgClamp(cfgNum(raw.humidity_max, 70), 40, 100),
    switches,
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
