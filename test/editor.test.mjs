import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenConfig, unflattenConfig } from '../src/editor.js';

const cfg = {
  type: 'custom:camper-card', name: 'Wohnwagen', vehicle: 'caravan', outline: 'caravan_round',
  entities: { battery: 'sensor.bat', fresh: 'sensor.water', pitch: 'input_number.p' },
  leveling: { track: 210, steps: [3, 6, 9], offset_pitch: 0.4 },
};

test('Editor: Konfiguration wird flach und wieder gegliedert, ohne Verlust', () => {
  const flat = flattenConfig(cfg);
  assert.equal(flat.battery, 'sensor.bat');
  assert.equal(flat.track, 210);
  assert.equal(flat.steps, '3, 6, 9');
  const back = unflattenConfig(flat, cfg);
  assert.deepEqual(back.entities, cfg.entities);
  assert.equal(back.leveling.track, 210);
  assert.equal(back.leveling.offset_pitch, 0.4);
  assert.equal(back.type, 'custom:camper-card');
});

test('Editor: geleerte Felder verschwinden aus der Konfiguration', () => {
  const back = unflattenConfig({ ...flattenConfig(cfg), fresh: '', track: undefined, invert_pitch: false }, cfg);
  assert.equal('fresh' in back.entities, false);
  assert.equal('track' in back.leveling, false);
  assert.equal('invert_pitch' in back.leveling, false);
});

test('Editor: neuer Fahrzeugtyp bekommt einen passenden Umriss', () => {
  const back = unflattenConfig({ ...flattenConfig(cfg), vehicle: 'van' }, cfg);
  assert.equal(back.outline, 'van_high');
  const keep = unflattenConfig({ ...flattenConfig(cfg), vehicle: 'van', outline: 'van_popup' }, cfg);
  assert.equal(keep.outline, 'van_popup');
});

test('Editor: eigene Namen und zweite Gasflasche überstehen das Formular', () => {
  const c2 = { ...cfg, entities: { ...cfg.entities, gas2: 'sensor.g2' }, names: { fresh: 'Färskvatten', gas2: 'Gas rechts' } };
  const flat = flattenConfig(c2);
  assert.equal(flat.name_fresh, 'Färskvatten');
  assert.equal(flat.gas2, 'sensor.g2');
  const back = unflattenConfig(flat, c2);
  assert.deepEqual(back.names, { fresh: 'Färskvatten', gas2: 'Gas rechts' });
  assert.equal(back.entities.gas2, 'sensor.g2');
  assert.equal('names' in unflattenConfig({ ...flat, name_fresh: '', name_gas2: ' ' }, c2), false);
});

test('Editor: pump_name aus 0.1 wird zu names.pump', () => {
  const old = { ...cfg, pump_name: 'Wasserhähne' };
  const flat = flattenConfig(old);
  assert.equal(flat.name_pump, 'Wasserhähne');
  const back = unflattenConfig(flat, old);
  assert.equal(back.names.pump, 'Wasserhähne');
  assert.equal('pump_name' in back, false);
});
