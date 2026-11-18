# Optional browser regressions

These tests use the built card and the existing simulated Home Assistant harness.
They do not need a Home Assistant server or real sensors. The normal `npm test`
suite remains dependency-free.

```sh
npm install --no-save --package-lock=false playwright-core
npm run build
for test_file in test/browser/*.test.mjs; do
  CHROMIUM_EXECUTABLE=/path/to/chromium node "$test_file" || exit 1
done
```

Run each regression script in this directory separately. A failed assertion
exits nonzero. `PLAYWRIGHT_MODULE` can optionally point to an existing Playwright
module installation instead of installing it in this repository.
