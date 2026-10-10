import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/utils/bookPageCapture.js', import.meta.url), 'utf8');
function setup() {
  const stats = { serializations: 0, fetches: 0, fail: false };
  const context = vm.createContext({
    URL,
    document: { baseURI: 'https://example.test/book/', createElementNS: () => ({ textContent: '' }) },
    fetch: async () => { stats.fetches++; return { ok: !stats.fail, status: 503, blob: async () => ({}) }; },
    FileReader: class {
      readAsDataURL() { this.result = 'data:font/woff2;base64,AA=='; this.onload(); }
    },
    XMLSerializer: class {
      serializeToString(style) {
        stats.serializations++;
        return `<style>${style.textContent.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</style>`;
      }
    },
  });
  vm.runInContext(source.slice(0, source.indexOf('// Capture resolved styles')) +
    ';globalThis.api={encodedStyle,encodedStyles,copyStyle};', context);
  return { ...context.api, stats };
}

test('concurrent and later captures reuse the same encoded font rule', async () => {
  const { encodedStyle, stats } = setup();
  const rule = '@font-face{font-family:Book;src:url("font.woff2");font-weight:200 900}';
  const a = encodedStyle(rule), b = encodedStyle(rule);
  assert.equal(a, b);
  assert.equal(await a, await encodedStyle(rule));
  assert.equal(stats.fetches, 1);
  assert.equal(stats.serializations, 1);
  assert.match(decodeURIComponent(await a), /font-weight:200 900/);
});

test('rule contents and URL base invalidate style cache, without refetching shared assets', async () => {
  const { encodedStyle, stats } = setup();
  const rule = '@font-face{font-family:Book;src:url("font.woff2");font-weight:400}';
  const before = await encodedStyle(rule);
  const changed = await encodedStyle(rule.replace('400', '700'));
  assert.notEqual(before, changed);
  assert.equal(stats.fetches, 1);
  await encodedStyle(rule, 'https://example.test/other/');
  assert.equal(stats.fetches, 2);
  assert.equal(stats.serializations, 3);
});

test('failed resource conversion can be retried', async () => {
  const { encodedStyle, stats } = setup();
  const rule = '@font-face{src:url("retry.woff2")}';
  stats.fail = true;
  await assert.rejects(encodedStyle(rule), /503/);
  stats.fail = false;
  await encodedStyle(rule);
  assert.equal(stats.fetches, 2);
  assert.equal(stats.serializations, 1);
});

test('style cache is bounded and slider rules are retained', async () => {
  const { encodedStyle, encodedStyles } = setup();
  for (let i = 0; i < 120; i++) await encodedStyle(`.range-${i}::-webkit-slider-thumb{width:20px}`);
  assert.equal(encodedStyles.size, 96);
  assert.match(decodeURIComponent(await encodedStyle('input::-webkit-slider-thumb{border:0}')), /border:0/);
});

test('style copying preserves resolved values and live slider custom properties', () => {
  const { copyStyle } = setup();
  const properties = {
    color: 'rgb(1, 2, 3)', content: '"text; with punctuation"',
    '--detail-range-progress': '70%', '--detail-range-accent': 'red',
    '--detail-animal-accent': 'blue', '--large-texture': 'url("large.png")',
  };
  const computed = Object.keys(properties);
  computed.getPropertyValue = key => properties[key];
  const target = {};
  copyStyle(computed, target);
  assert.match(target.cssText, /--detail-range-progress:70%/);
  assert.match(target.cssText, /content:"text; with punctuation"/);
  assert.doesNotMatch(target.cssText, /large-texture/);
  assert.match(target.cssText, /animation:none!important;transition:none!important;/);
});
