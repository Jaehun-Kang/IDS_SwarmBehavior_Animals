import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRangePercent, getControlDisplayCandidates } from '../src/utils/simControlDisplay.js';

test('width candidates belong only to the current animal field', () => {
  assert.deepEqual(getControlDisplayCandidates({type:'binary-toggle',offValue:'predator',onValue:'food'}), ['predator','food']);
  assert.deepEqual(getControlDisplayCandidates({type:'toggle'}), [false,true]);
  assert.deepEqual(getControlDisplayCandidates({type:'cycle-toggle',values:['day','night']}), ['day','night']);
  assert.deepEqual(getControlDisplayCandidates({type:'static'}), []);
  assert.deepEqual(getControlDisplayCandidates({type:'select',options:['a',{value:'b',label:'B'}]}), ['a','b']);
});

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
