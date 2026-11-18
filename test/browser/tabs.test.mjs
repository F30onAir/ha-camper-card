import assert from 'node:assert/strict';
import { openHarness } from './harness.mjs';

const harness = await openHarness();
try {
  for (const [width, touch] of [[390, false], [390, true], [1280, false]]) {
    const page = await harness.browser.newPage({ viewport: { width, height: 900 }, hasTouch: touch, isMobile: touch });
    await page.goto(harness.url);
    await page.locator('#c1 [data-fid="v2"]').click();
    for (const [target, view] of [['v1', 'overview'], ['v2', 'level']]) {
      const button = page.locator(`#c1 [data-fid="${target}"]`);
      const box = await button.boundingBox();
      const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const cdp = touch ? await page.context().newCDPSession(page) : null;
      if (touch) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
      else { await page.mouse.move(point.x, point.y); await page.mouse.down(); }
      await page.evaluate(value => {
        window.__h.st('input_number.tilt_length', value, '°');
        window.__h.push();
      }, target === 'v1' ? 3 : 4);
      if (touch) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForFunction(expected => window.__h.cards[0]._ui.view === expected, view, { timeout: 1000 });
        await cdp.detach();
      } else await page.mouse.up();
      const actual = await page.evaluate(() => window.__h.cards[0]._ui.view);
      console.log({ width, touch, target, expected: view, actual });
      assert.equal(actual, view, 'sensor update during the press must not swallow the click');
      assert.equal(await button.getAttribute('aria-selected'), 'true');
    }
    // Changes to configuration and language still refresh the persistent header.
    await page.evaluate(() => {
      window.__h.ui.lang = 'en';
      window.__h.setConfig({ ...window.__h.CFG, name: 'Test camper' });
    });
    assert.equal(await page.locator('#c1 .cc-name').textContent(), 'Test camper');
    assert.equal(await page.locator('#c1 [data-fid="v1"]').textContent(), 'Overview');
    await page.close();
  }
} finally { await harness.close(); }
