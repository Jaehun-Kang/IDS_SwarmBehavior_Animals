import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRangePercent } from '../src/utils/simControlDisplay.js';

test('relative display preserves the meaning of the slider range', () => {
  assert.equal(formatRangePercent(0.01, 0, 0.05), '20 %');
  assert.equal(formatRangePercent(0.22, 0.1, 0.4), '40 %');
  assert.equal(formatRangePercent(-1.5, -3, 0), '50 %');
  assert.equal(formatRangePercent(0.5, 0.5, 2.5), '0 %');
  assert.equal(formatRangePercent(2.5, 0.5, 2.5), '100 %');
});

test('invalid values cannot produce a NaN label', () => {
  assert.equal(formatRangePercent(NaN, 0, 1), '-');
  assert.equal(formatRangePercent(0, 1, 1), '-');
  assert.equal(formatRangePercent(-2, 0, 1), '0 %');
  assert.equal(formatRangePercent(2, 0, 1), '100 %');
});
