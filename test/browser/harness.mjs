import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function openHarness() {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const server = createServer(async (req, res) => {
    try {
      const file = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
      if (!file.startsWith(root + '/')) throw Error('Invalid path');
      const type = extname(file) === '.html' ? 'text/html' : 'text/javascript';
      res.setHeader('Content-Type', type + '; charset=utf-8');
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true });
    return {
      browser,
      url: `http://127.0.0.1:${server.address().port}/test/harness.html`,
      async close() { await browser.close(); await new Promise(r => server.close(r)); },
    };
  } catch (error) { await new Promise(r => server.close(r)); throw error; }
}
