import test from 'node:test';
import assert from 'node:assert/strict';
import { alarmModes, alarmKind, alarmNeedsCode, openSensors, isAlarmo, alarmRemaining, forceMode, alarmCall } from '../src/alarm.js';

test('Modi aus supported_features, in fester Reihenfolge', () => {
  assert.deepEqual(alarmModes(2 | 4 | 8), ['away', 'night']); // 8 = Auslösen, keine Taste
  assert.deepEqual(alarmModes(1 | 2 | 4 | 16 | 32), ['away', 'night', 'home', 'vacation', 'custom_bypass']);
  assert.deepEqual(alarmModes(undefined), []);
});

test('Zustände werden zusammengefasst', () => {
  assert.equal(alarmKind('armed_night'), 'armed');
  assert.equal(alarmKind('armed_custom_bypass'), 'armed');
  assert.equal(alarmKind('pending'), 'pending');
  assert.equal(alarmKind('triggered'), 'triggered');
  assert.equal(alarmKind('irgendwas'), 'other');
});

test('Code nur, wenn der nächste Schritt einen verlangt', () => {
  assert.equal(alarmNeedsCode('disarmed', { code_format: null }), false); // Alarmo: kein Code zum Scharfschalten
  assert.equal(alarmNeedsCode('armed_away', { code_format: 'number' }), true);
  assert.equal(alarmNeedsCode('disarmed', { code_format: 'number', code_arm_required: false }), false); // andere Anlagen
  assert.equal(alarmNeedsCode('armed_away', { code_format: 'number', code_arm_required: false }), true);
  assert.equal(alarmNeedsCode('disarmed', undefined), false);
});

test('Offene Sensoren aus Alarmo', () => {
  assert.deepEqual(openSensors({ open_sensors: { 'binary_sensor.dachluke': 'open', 'binary_sensor.tuer': 'unavailable' } }),
    [['binary_sensor.dachluke', 'open'], ['binary_sensor.tuer', 'unavailable']]);
  assert.deepEqual(openSensors({ open_sensors: null }), []);
  assert.deepEqual(openSensors({}), []);
});

test('Alarmo an den eigenen Attributen erkennen', () => {
  assert.equal(isAlarmo({ arm_mode: null, open_sensors: null }), true);
  assert.equal(isAlarmo({ code_format: 'number', changed_by: 'Max' }), false);
});

test('Restzeit aus delay und last_changed', () => {
  const t0 = '2026-11-20T10:00:00+00:00', ms = Date.parse(t0);
  assert.equal(alarmRemaining(30, t0, ms + 5000), 25);
  assert.equal(alarmRemaining(30, t0, ms + 4200), 26); // angefangene Sekunde zählt mit
  assert.equal(alarmRemaining(30, t0, ms + 60000), 0);
  assert.equal(alarmRemaining(30, t0, ms - 10000), 30); // Browseruhr geht nach: nie mehr als delay
  assert.equal(alarmRemaining(null, t0, ms), null);
  assert.equal(alarmRemaining(30, 'kaputt', ms), null);
});

test('Modus für „Trotzdem scharf schalten“', () => {
  assert.equal(forceMode('night', ['away', 'night']), 'night'); // zuletzt auf der Karte gewählt
  assert.equal(forceMode(undefined, ['night']), 'night');
  assert.equal(forceMode(undefined, ['home', 'away']), 'away');
  assert.equal(forceMode(undefined, ['home', 'night']), 'home');
  assert.equal(forceMode(undefined, []), null);
});

test('Dienstaufrufe', () => {
  assert.deepEqual(alarmCall('alarm_control_panel.wowa', 'arm', 'away', ''), ['alarm_control_panel', 'alarm_arm_away', { entity_id: 'alarm_control_panel.wowa' }]);
  assert.deepEqual(alarmCall('alarm_control_panel.wowa', 'disarm', '', '1234'), ['alarm_control_panel', 'alarm_disarm', { entity_id: 'alarm_control_panel.wowa', code: '1234' }]);
  assert.deepEqual(alarmCall('alarm_control_panel.wowa', 'force', 'custom_bypass', ''), ['alarmo', 'arm', { entity_id: 'alarm_control_panel.wowa', mode: 'custom', force: true }]);
});
