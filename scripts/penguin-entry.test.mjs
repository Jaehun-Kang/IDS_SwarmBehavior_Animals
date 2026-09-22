import test from 'node:test';
import assert from 'node:assert/strict';
import { isPenguinEntryAnchor } from '../src/utils/penguinEntry.js';

test('walking original residents still trigger distance-based standing', () => {
  for (const mode of ['seek_huddle','free_walk','rest_huddle']) {
    assert.equal(isPenguinEntryAnchor({mode,lastMeasuredSpeed:14,countTransition:null,countTransitionSource:null},'cooling_exit'),true);
  }
});

test('new arrivals cannot trigger a chain, even after standing', () => {
  for(const countTransition of ['enter',null]) {
    assert.equal(isPenguinEntryAnchor({mode:'rest_huddle',countTransition,countTransitionSource:'count-enter'},'cooling_exit'),false);
  }
  assert.equal(isPenguinEntryAnchor({mode:'free_walk',countTransition:'exit'},'cooling_exit'),false);
  assert.equal(isPenguinEntryAnchor({mode:'cooling_exit'},'cooling_exit'),false);
});
