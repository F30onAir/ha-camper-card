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

test('Editor 0.3: Schalter, Frostwarnung und neue Felder überstehen das Formular', () => {
  const c3 = {
    ...cfg, battery_capacity: 100, frost_warning: false, frost_temp: 2,
    entities: { ...cfg.entities, temp_outside: 'sensor.out', humidity_inside: 'sensor.hum' },
    switches: [{ entity: 'switch.fridge', name: 'Kühlschrank', icon: 'mdi:fridge' }, 'switch.boiler'],
  };
  const flat = flattenConfig(c3);
  assert.equal(flat.sw1, 'switch.fridge');
  assert.equal(flat.sw1_name, 'Kühlschrank');
  assert.equal(flat.sw1_icon, 'mdi:fridge');
  assert.equal(flat.sw2, 'switch.boiler');
  assert.equal(flat.frost_warning, false);
  const back = unflattenConfig(flat, c3);
  assert.deepEqual(back.switches, [{ entity: 'switch.fridge', name: 'Kühlschrank', icon: 'mdi:fridge' }, { entity: 'switch.boiler' }]);
  assert.equal(back.frost_warning, false);
  assert.equal(back.battery_capacity, 100);
  assert.equal(back.frost_temp, 2);
  assert.equal(back.entities.temp_outside, 'sensor.out');
  assert.equal(back.entities.humidity_inside, 'sensor.hum');
});

test('Editor 0.3: Frostwarnung an ist Standard und wird nicht gespeichert, leerer Schalter fällt weg', () => {
  const flat = flattenConfig(cfg);
  assert.equal(flat.frost_warning, true);
  const back = unflattenConfig({ ...flat, sw1: '', sw1_name: 'Rest', sw2: 'switch.b' }, cfg);
  assert.equal('frost_warning' in back, false);
  assert.deepEqual(back.switches, [{ entity: 'switch.b' }]);
  assert.equal('switches' in unflattenConfig(flat, cfg), false);
});
