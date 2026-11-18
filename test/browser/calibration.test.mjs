import assert from 'node:assert/strict';
import { openHarness } from './harness.mjs';

const harness = await openHarness();
try {
  for (const input of ['mouse', 'touch', 'keyboard']) {
    const page = await harness.browser.newPage({ viewport: {width: 800, height: 900}, hasTouch: true });
    await page.goto(harness.url);
    await page.waitForFunction(() => !!window.__h);
    await page.evaluate(async () => {
      // Only stub ha-form; exercise the real editor and its config-changed event.
      if (!customElements.get('ha-form')) customElements.define('ha-form', class extends HTMLElement {});
      const editor = document.createElement('camper-card-editor');
      editor.id = 'editor';
      editor.setConfig({...window.__h.CFG, language: 'en'});
      editor.hass = window.__h.cards[0].hass;
      window.saved = [];
      editor.addEventListener('config-changed', e => window.saved.push(e.detail.config));
      document.body.prepend(editor);
    });
    const button = page.locator('#editor button[data-a="zero"]');
    await button.waitFor();
    const bounds = await button.boundingBox();
    const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
    let cdp;
    if (input === 'mouse') { await page.mouse.move(x, y); await page.mouse.down(); }
    else if (input === 'touch') {
      cdp = await page.context().newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
    } else { await button.focus(); }
    await page.evaluate(() => {
      const h = window.__h;
      h.st('input_number.tilt_length', 2, '°');
      h.st('input_number.tilt_side', -1, '°'); h.push();
      document.getElementById('editor').hass = h.cards[0].hass;
    });
    if (input === 'mouse') await page.mouse.up();
    else if (input === 'touch') await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    else await page.keyboard.press('Enter');
    const saved = await page.evaluate(() => window.saved);
    assert.equal(saved.length, 1, `${input}: calibration click was lost during sensor update`);
    assert.equal(saved[0].leveling.offset_pitch, 2);
    assert.equal(saved[0].leveling.offset_roll, -1);
    await page.locator('#editor button[data-a="reset"]').click();
    assert.equal(await page.evaluate(() => window.saved.at(-1).leveling?.offset_pitch), undefined);
    await page.evaluate(() => {
      window.__h.st('input_number.tilt_length', 'unavailable', '°'); window.__h.push();
      document.getElementById('editor').hass = window.__h.cards[0].hass;
    });
    assert.equal(await button.isDisabled(), true, 'Unavailable sensor disables calibration');
    console.log({input, calibrate: 'passed', reset: 'passed', offline: 'passed'});
    await page.close();
  }
} finally { await harness.close(); }
