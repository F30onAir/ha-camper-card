import assert from 'node:assert/strict';
import { openHarness } from './harness.mjs';
const h = await openHarness();
try {
  const page = await h.browser.newPage();
  await page.goto(h.url);
  for (const [soc, expected] of [[0, /0\s*min/], [-1, /0\s*min/], [50, /10\s*h/]]) {
    await page.evaluate(soc => {
      window.__h.ui.lang = 'en';
      window.__h.setConfig({...window.__h.CFG, battery_capacity:100, battery_voltage:12.8});
      window.__h.st('sensor.battery_soc', soc, '%');
      window.__h.st('sensor.battery_power', -64, 'W');
      window.__h.push();
    }, soc);
    const text = await page.locator('#c1 [data-sub="battery"]').textContent();
    console.log({soc, text});
    assert.match(text, expected);
  }
  await page.close();
} finally {await h.close();}
