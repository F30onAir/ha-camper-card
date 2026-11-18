import assert from 'node:assert/strict';
import { openHarness } from './harness.mjs';
const h = await openHarness();
try {
  const page = await h.browser.newPage({viewport:{width:390,height:900}});
  await page.goto(h.url);
  for (const state of ['63', 'unavailable', '64']) {
    const tile = page.locator('#c1 [data-tile="fresh"]');
    await tile.focus();
    await page.evaluate(state => {
      document.body.style.paddingBottom = '2000px';
      window.scrollTo(0, 900);
      window.__h.st('sensor.fresh_water_level', state, '%');
      window.__h.push();
    }, state);
    assert.equal(await tile.evaluate(el => el.getRootNode().activeElement === el), true,
      'the focused sensor tile must survive a state update or an offline transition');
    assert.equal(await page.evaluate(() => scrollY), 900, 'focus restoration must not scroll');
    await page.keyboard.press('Enter');
    assert.match(await page.locator('#log').textContent(), /more-info sensor.fresh_water_level/);
    console.log({state, focus:true, scroll:900, moreInfo:true});
  }
  await page.close();
} finally {await h.close();}
