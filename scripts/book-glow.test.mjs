import test from 'node:test';
import {drawBookSpriteGlow} from '../src/components/bookPreviews/bookGlowDrawing.js';
test('non-emitting animals are untouched without building glow layers',()=>{
 drawBookSpriteGlow({}, {}, 0, 0, 10, 10, 0);
 drawBookSpriteGlow({}, {}, 0, 0, 10, 10, -1);
});
test('invalid or missing sprites are ignored',()=>{
 drawBookSpriteGlow({}, null, 0, 0, 10, 10, 1);
 drawBookSpriteGlow({}, {}, 0, 0, NaN, 10, 1);
});
