import assert from 'node:assert/strict';
import { openHarness } from './harness.mjs';

const harness = await openHarness();
try {
  const page = await harness.browser.newPage();
  await page.goto(harness.url);
  for (const [name, power, solar, charger, chargerPower, units] of [
    ['solar charging', 145, 210, false, 0, ['kW', 'kW', 'kW']],
    ['charger charging', 180, 0, true, 215, ['kW', 'kW', 'kW']],
    ['both sources', 260, 150, true, 140, ['kW', 'kW', 'kW']],
    ['discharging', -42, 210, false, 0, ['kW', 'kW', 'kW']],
    ['below thresholds', 3, 4, true, 8, ['kW', 'kW', 'kW']],
    ['mixed units', 40, 10, true, 8, ['W', 'kW', 'kW']],
  ]) {
    const result = await page.evaluate(({ power, solar, charger, chargerPower, units }) => {
      const h = window.__h;
      h.setConfig({ ...h.CFG, battery_capacity: 100 });
      const render = units => {
        for (const [id, value, unit] of [
          ['sensor.battery_power', power, units[0]],
          ['input_number.solar_power', solar, units[1]],
          ['sensor.charger_power', chargerPower, units[2]],
        ]) h.st(id, unit === 'kW' ? value / 1000 : value, unit);
        h.st('switch.charger', charger ? 'on' : 'off');
        h.push();
        const root = h.cards[0].shadowRoot;
        return {
          tiles: root.querySelector('.tiles').textContent,
          solarFlow: root.querySelectorAll('.flow:not(.c)').length,
          chargerFlow: root.querySelectorAll('.flow.c').length,
        };
      };
      return { watts: render(['W', 'W', 'W']), converted: render(units) };
    }, { power, solar, charger, chargerPower, units });
    console.log(name, JSON.stringify(result));
    assert.deepEqual(result.converted, result.watts,
      'equivalent power readings must give identical values, charging status, sources and runtime');
  }
  await page.close();
} finally { await harness.close(); }
