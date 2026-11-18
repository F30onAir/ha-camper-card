import test from 'node:test';
import assert from 'node:assert/strict';
import { chargeSources, sourceKey } from '../src/sources.js';

for (const [charger, chargerPower, expected] of [
  ['ok', 'off', false], ['off', 'ok', false], ['off', 'off', false],
  ['ok', 'none', true], ['none', 'ok', true], ['ok', 'ok', true],
]) {
  test(`charger activity with switch=${charger}, power=${chargerPower}`, () => {
    const result = chargeSources({power:'ok', solar:'none', charger, chargerPower},
      {power:100, charger:true, chargerPower:120}, 10);
    assert.equal(result.chargerActive, expected);
    assert.equal(sourceKey(result), expected ? 'charger' : 'unknown');
  });
}
test('unavailable charger measurement recovers without reconfiguring', () => {
  const states = {power:'ok', solar:'none', charger:'ok', chargerPower:'off'};
  const values = {power:100, charger:true, chargerPower:0};
  assert.equal(chargeSources(states, values, 10).chargerActive, false);
  states.chargerPower = 'ok';
  assert.equal(chargeSources(states, values, 10).chargerActive, false);
  values.chargerPower = 120;
  assert.equal(chargeSources(states, values, 10).chargerActive, true);
});
