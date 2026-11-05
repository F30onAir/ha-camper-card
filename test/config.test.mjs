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
