import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfig, parseSteps } from '../src/config.js';

test('Leere Konfiguration ergibt Wohnwagen mit Standardwerten', () => {
  const c = normalizeConfig({ type: 'custom:camper-card' });
  assert.equal(c.vehicle, 'caravan');
  assert.equal(c.outline, 'caravan_round');
  assert.equal(c.offline, 'grey');
  assert.equal(c.language, 'auto');
  assert.equal(c.leveling.track, 215);
  assert.equal(c.leveling.base, 430);
  assert.equal(c.leveling.defaults, true);
  assert.equal(c.leveling.tolerance, 0.2);
  assert.equal(c.charger_min_power, 10);
  assert.equal(c.charger_toggle, false);
  assert.deepEqual(c.entities, {});
});

test('Fahrzeugtyp ergibt sich aus dem Umriss', () => {
  assert.equal(normalizeConfig({ outline: 'mh_alcove' }).vehicle, 'motorhome');
  assert.equal(normalizeConfig({ outline: 'van_popup' }).vehicle, 'van');
});

test('Unpassender Umriss wird auf den ersten des Typs gesetzt', () => {
  const c = normalizeConfig({ vehicle: 'van', outline: 'caravan_box' });
  assert.equal(c.outline, 'van_high');
  assert.equal(normalizeConfig({ vehicle: 'motorhome', outline: 'gibt-es-nicht' }).outline, 'mh_semi');
});

test('Eigene Maße ersetzen die Standardwerte', () => {
  const c = normalizeConfig({ leveling: { track: 208, base: 415 } });
  assert.equal(c.leveling.track, 208);
  assert.equal(c.leveling.base, 415);
  assert.equal(c.leveling.defaults, false);
  assert.equal(normalizeConfig({ leveling: { track: 208 } }).leveling.defaults, true);
  assert.equal(normalizeConfig({ leveling: { track: '', base: 0 } }).leveling.track, 215);
});

test('Entitäten: nur gültige Einträge werden übernommen', () => {
  const c = normalizeConfig({ entities: { battery: 'sensor.a', fresh: '', gas: 42, unbekannt: 'sensor.x', gas_availability: 'sensor.b' } });
  assert.deepEqual(c.entities, { battery: 'sensor.a', gas_availability: 'sensor.b' });
});

test('Keilstufen aus Text, Zahl und Liste', () => {
  assert.deepEqual(parseSteps('3, 6, 9'), [3, 6, 9]);
  assert.deepEqual(parseSteps('9;3 6'), [3, 6, 9]);
  assert.deepEqual(parseSteps('4.5, 9'), [4.5, 9]);
  assert.deepEqual(parseSteps([6, 3, 'x', -1]), [3, 6]);
  assert.deepEqual(parseSteps(5), [5]);
  assert.deepEqual(parseSteps(undefined), []);
});

test('Toleranz wird begrenzt, Offline-Verhalten und Sprache geprüft', () => {
  assert.equal(normalizeConfig({ leveling: { tolerance: 99 } }).leveling.tolerance, 5);
  assert.equal(normalizeConfig({ leveling: { tolerance: -1 } }).leveling.tolerance, 0);
  assert.equal(normalizeConfig({ offline: 'hide' }).offline, 'hide');
  assert.equal(normalizeConfig({ offline: 'quatsch' }).offline, 'grey');
  assert.equal(normalizeConfig({ language: 'fr' }).language, 'auto');
});

test('Ohne Konfiguration gibt es einen verständlichen Fehler', () => {
  assert.throws(() => normalizeConfig(null), /Konfiguration fehlt/);
});

test('Eigene Kachelnamen: getrimmt, begrenzt, intern nach Schlüssel der Karte', () => {
  const c = normalizeConfig({ names: { fresh: '  Färskvatten ', gas2: 'Gasol höger', temp_inside: 'Inne', unbekannt: 'x', solar: '', battery: 42 } });
  assert.deepEqual(c.names, { fresh: 'Färskvatten', gas2: 'Gasol höger', tempIn: 'Inne' });
  assert.equal(normalizeConfig({ names: { fresh: 'x'.repeat(80) } }).names.fresh.length, 40);
  assert.deepEqual(normalizeConfig({}).names, {});
});

test('pump_name aus 0.1 gilt weiter, names.pump hat Vorrang', () => {
  assert.equal(normalizeConfig({ pump_name: 'Wasserhähne' }).names.pump, 'Wasserhähne');
  assert.equal(normalizeConfig({ pump_name: 'Alt', names: { pump: 'Neu' } }).names.pump, 'Neu');
});

test('Zweite Gasflasche mit eigener Verfügbarkeit', () => {
  const c = normalizeConfig({ entities: { gas: 'sensor.g1', gas2: 'sensor.g2', gas2_availability: 'sensor.raw2' } });
  assert.deepEqual(c.entities, { gas: 'sensor.g1', gas2: 'sensor.g2', gas2_availability: 'sensor.raw2' });
});

test('Kastenwagen (Ducato-Typ) ist ein eigener Van-Umriss, Hochdach bleibt der Standard', () => {
  const c = normalizeConfig({ outline: 'van_ducato' });
  assert.equal(c.vehicle, 'van');
  assert.equal(c.outline, 'van_ducato');
  assert.equal(c.leveling.base, 404);
  assert.equal(normalizeConfig({ vehicle: 'van' }).outline, 'van_high');
});

test('0.3: neue Sensoren für außen, Gefrierfach und Luftfeuchte, mit eigenen Namen', () => {
  const c = normalizeConfig({
    entities: { temp_outside: 'sensor.out', temp_freezer: 'sensor.frz', humidity_inside: 'sensor.hum' },
    names: { temp_outside: 'Ute', temp_freezer: 'Frys', humidity_inside: 'Fukt' },
  });
  assert.deepEqual(c.entities, { temp_outside: 'sensor.out', temp_freezer: 'sensor.frz', humidity_inside: 'sensor.hum' });
  assert.deepEqual(c.names, { tempOut: 'Ute', tempFreezer: 'Frys', humIn: 'Fukt' });
});

test('0.3: Restlaufzeit, Frostwarnung und Luftfeuchte haben sinnvolle Standardwerte', () => {
  const c = normalizeConfig({});
  assert.equal(c.battery_capacity, null);
  assert.equal(c.battery_voltage, 12.8);
  assert.equal(c.frost_warning, true);
  assert.equal(c.frost_temp, 3);
  assert.equal(c.humidity_max, 70);
  assert.deepEqual(c.switches, []);
  const d = normalizeConfig({ battery_capacity: '100', battery_voltage: 99, frost_warning: false, frost_temp: -40, humidity_max: 10 });
  assert.equal(d.battery_capacity, 100);
  assert.equal(d.battery_voltage, 60);
  assert.equal(d.frost_warning, false);
  assert.equal(d.frost_temp, -10);
  assert.equal(d.humidity_max, 40);
  assert.equal(normalizeConfig({ battery_capacity: -5 }).battery_capacity, null);
});

test('0.3: frei belegbare Schalter werden geprüft und begrenzt', () => {
  const c = normalizeConfig({ switches: [
    { entity: 'switch.kuehlschrank', name: '  Kühlschrank ', icon: 'mdi:fridge' },
    'switch.boiler',
    { entity: 'kaputt' }, { name: 'ohne Entität' }, null, 42,
    { entity: 'light.vorzelt', icon: '<script>' },
  ] });
  assert.deepEqual(c.switches, [
    { entity: 'switch.kuehlschrank', name: 'Kühlschrank', icon: 'mdi:fridge' },
    { entity: 'switch.boiler', name: null, icon: null },
    { entity: 'light.vorzelt', name: null, icon: null },
  ]);
  const many = normalizeConfig({ switches: Array.from({ length: 9 }, (_, i) => `switch.s${i}`) });
  assert.equal(many.switches.length, 6);
  assert.deepEqual(normalizeConfig({ switches: 'switch.x' }).switches, []);
});
