# Browser scrolling regression

The normal `npm test` suite does not require a browser. To also check that a
sensor update preserves page position and keyboard focus, run:

```sh
npm install --no-save --package-lock=false playwright-core
npm run build
CHROMIUM_EXECUTABLE=/path/to/chromium node test/scroll-browser.mjs
```

This uses the existing local harness with simulated Home Assistant states. It
checks phone and desktop widths, an updated battery value, the page scroll
position, and restored tab focus. No Home Assistant instance or hardware is
required. It does not test the separate card-column layout issue.
