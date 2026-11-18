// Optional browser regression: see test/README.md.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const server = createServer(async (req, res) => {
  try {
    const file = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(root + '/')) throw Error('Invalid path');
    const type = extname(file) === '.html' ? 'text/html' : 'text/javascript';
    res.setHeader('Content-Type', type + '; charset=utf-8');
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE,
    headless: true,
  });
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 700 } });
    await page.goto(`http://127.0.0.1:${server.address().port}/test/harness.html`);
    await page.waitForFunction(() =>
      window.__h?.cards[0].shadowRoot.querySelector('[data-fid="v1"]'));
    const result = await page.evaluate(async () => {
      const spacer = document.createElement('div');
      spacer.style.height = '2500px';
      document.body.append(spacer);
      const card = window.__h.cards[0];
      card.shadowRoot.querySelector('[data-fid="v1"]').focus();
      window.scrollTo(0, 1200);
      await new Promise(r => requestAnimationFrame(r));
      const before = window.scrollY;
      window.__h.st('sensor.battery_soc', 42, '%');
      window.__h.push();
      await new Promise(r => requestAnimationFrame(r));
      return {
        before,
        after: window.scrollY,
        focused: card.shadowRoot.activeElement?.dataset.fid,
        updated: card.shadowRoot.textContent.includes('42'),
      };
    });
    console.log(JSON.stringify({ width, ...result }));
    assert.equal(result.before, 1200, 'test must start scrolled away from the card');
    assert.equal(result.after, result.before, 'sensor update must not scroll the page');
    assert.equal(result.focused, 'v1', 'keyboard focus must be preserved');
    assert.equal(result.updated, true, 'new sensor value must be rendered');
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(r => server.close(r));
}
