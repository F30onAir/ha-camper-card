import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfig } from '../src/config.js';
const top = ['charger_min_power', 'battery_capacity', 'battery_voltage', 'frost_temp', 'humidity_max'];
const leveling = ['track', 'base', 'max_wedge', 'tolerance', 'offset_pitch', 'offset_roll'];
for (const empty of [null, undefined, '']) {
  test(`empty numeric YAML values use defaults (${String(empty)})`, () => {
    const raw = Object.fromEntries(top.map(k => [k, empty]));
    raw.leveling = Object.fromEntries(leveling.map(k => [k, empty]));
    assert.deepEqual(normalizeConfig(raw), normalizeConfig({}));
  });
}
test('explicit zero remains distinct from an empty numeric setting', () => {
  const c = normalizeConfig({charger_min_power:0, frost_temp:0, leveling:{max_wedge:0, tolerance:0}});
  assert.equal(c.charger_min_power,0);
  assert.equal(c.frost_temp,0);
  assert.equal(c.leveling.max_wedge,0);
  assert.equal(c.leveling.tolerance,0);
});
