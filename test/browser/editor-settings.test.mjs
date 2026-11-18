import assert from 'node:assert/strict';
import { openHarness } from './harness.mjs';

const harness = await openHarness();
try {
  const page = await harness.browser.newPage();
  await page.goto(harness.url);
  await page.waitForFunction(() => !!window.__h);
  await page.evaluate(() => {
    if (!customElements.get('ha-form')) customElements.define('ha-form', class extends HTMLElement {});
    const editor = document.createElement('camper-card-editor');
    editor.id = 'editor';
    window.original = {...window.__h.CFG,
      visibility: [{condition: 'state', entity: 'input_boolean.show_camper', state: 'on'}],
      grid_options: {columns: 6, rows: 8}, view_layout: {position: 'main'},
      card_mod: {style: 'ha-card { border-radius: 0; }'},
    };
    editor.setConfig(window.original);
    editor.hass = window.__h.cards[0].hass;
    editor.addEventListener('config-changed', e => { window.saved = e.detail.config; });
    document.body.prepend(editor);
  });
  await page.waitForFunction(() => !!document.getElementById('editor').shadowRoot.querySelector('ha-form')?.data);
  const result = await page.evaluate(() => {
    const form = document.getElementById('editor').shadowRoot.querySelector('ha-form');
    form.dispatchEvent(new CustomEvent('value-changed', {detail: {value: {...form.data, name: 'Renamed camper', fresh: ''}}}));
    return {original: window.original, saved: window.saved};
  });
  for (const key of ['visibility', 'grid_options', 'view_layout', 'card_mod']) {
    assert.deepEqual(result.saved[key], result.original[key], key);
  }
  assert.equal(result.saved.name, 'Renamed camper');
  assert.equal(result.saved.entities.fresh, undefined);
  console.log('Editor config-changed preserves dashboard options and applies card edits.');
} finally { await harness.close(); }
