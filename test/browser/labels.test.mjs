import assert from 'node:assert/strict';
import { openHarness } from './harness.mjs';

const harness = await openHarness();
try {
  const page = await harness.browser.newPage({ viewport: { width: 1100, height: 1000 } });
  await page.goto(harness.url);
  for (const width of [500, 320, 343, 720]) {
    await page.evaluate(width => {
      document.querySelector('.w-phone').style.width = width + 'px';
      window.__h.setConfig({ ...window.__h.CFG,
        names: { temp_inside: 'Innentemperatur', temp_fridge: 'Outside refrigerator temperature' } });
    }, width);
    const columns = await page.locator('#c1 .tiles').evaluate(el => {
      const top = el.firstElementChild.getBoundingClientRect().top;
      return [...el.children].filter(tile => Math.abs(tile.getBoundingClientRect().top - top) < 1).length;
    });
    console.log({ cardWidth: width, columns });
    assert.ok(width < 560 ? columns <= 2 : columns >= 3, 'columns should adapt to card width');
    for (const key of ['tempIn', 'tempFridge']) {
      const label = page.locator(`#c1 [data-tile="${key}"] .t-l`);
      const dimensions = await label.evaluate(el => ({
        text: el.textContent,
        width: el.clientWidth, contentWidth: el.scrollWidth,
        height: el.clientHeight, contentHeight: el.scrollHeight,
      }));
      console.log({ cardWidth: width, key, ...dimensions });
      assert.ok(dimensions.contentWidth <= dimensions.width + 1, 'label must not be clipped horizontally');
      assert.ok(dimensions.contentHeight <= dimensions.height + 1, 'label must not be clipped vertically');
    }
    const overflow = await page.locator('#c1 ha-card').evaluate(el => el.scrollWidth > el.clientWidth + 1);
    assert.equal(overflow, false, 'card must not overflow at narrow widths');
  }
  await page.close();
} finally { await harness.close(); }
