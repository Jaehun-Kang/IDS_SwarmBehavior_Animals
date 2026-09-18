import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/behaviors/swarm/11_Krill.jsx", import.meta.url), "utf8");
const context = vm.createContext({});
vm.runInContext(
  source.slice(source.indexOf("const DIRECT_FINDING_PARAMS ="), source.indexOf("export function App(")) +
    ";globalThis.api = { PARAMS, createFoodPatch, consumeFoodAt, sampleFood, calculateFoodAttractionForce, drawFoodField, resolveBehaviorConfig };",
  context,
);
const api = context.api;
const patch = (biomass = 1) => ({
  ...api.createFoodPatch(100, 100, 600, 400),
  orbitX: 0, orbitY: 0, phase: 0, radius: 50, biomass,
});
const canvas = () => {
  const colors = [];
  return {
    colors,
    createRadialGradient(...values) {
      assert.ok(values.every(Number.isFinite));
      assert.ok(values[5] > 0);
      return { addColorStop(offset, color) {
        assert.ok(offset >= 0 && offset <= 1);
        assert.doesNotMatch(color, /NaN|Infinity|undefined/);
        const alpha = Number(color.slice(color.lastIndexOf(",") + 1, -1));
        assert.ok(Number.isFinite(alpha) && alpha >= 0 && alpha <= 1);
        colors.push(color);
      } };
    },
    beginPath() {}, arc() {}, fill() {},
  };
};

test("food-related PARAMS references resolve to finite numeric values", () => {
  for (const [, key] of source.matchAll(/PARAMS\.((?:FOOD_|RENDER_FOOD_|STOMACH_|PARACHUTE_)[A-Z_]+)/g)) {
    if (key === "RENDER_FOOD_COLOR") continue;
    assert.ok(Number.isFinite(api.PARAMS[key]), key);
  }
});

test("normal consumption and gradient opacity are preserved", () => {
  const food = patch();
  api.consumeFoodAt([food], 100, 100, 0, 0.2);
  assert.equal(food.biomass, 0.8);
  const ctx = canvas();
  api.drawFoodField(ctx, [food], 0);
  assert.equal(ctx.colors[0], `rgba(99, 185, 124, ${0.8 * api.PARAMS.RENDER_FOOD_ALPHA})`);
});

test("invalid agent position, time or consumption cannot poison shared biomass", () => {
  for (const value of [NaN, Infinity, -Infinity, undefined]) {
    for (let index = 0; index < 4; index++) {
      const args = [100, 100, 0, 0.2];
      args[index] = value;
      const food = patch();
      api.consumeFoodAt([food], ...args);
      assert.equal(food.biomass, 1);
      api.drawFoodField(canvas(), [food], 0);
    }
  }
});

test("corrupted biomass does not break drawing, food sensing or attraction", () => {
  const config = api.resolveBehaviorConfig();
  for (const value of [NaN, Infinity, -Infinity]) {
    const food = [patch(value), patch(0.5)];
    const ctx = canvas();
    api.drawFoodField(ctx, food, 0);
    assert.equal(ctx.colors.length, 2);
    assert.ok(Number.isFinite(api.sampleFood(food, 100, 100, 0, config)));
    const force = api.calculateFoodAttractionForce(food, { x: 90, y: 90, stomachFullness: 0 }, 0, config);
    assert.ok(Object.values(force).every(Number.isFinite));
  }
});

test("invalid patch geometry cannot crash drawing or contaminate other patches", () => {
  const config = api.resolveBehaviorConfig();
  for (const field of ["anchorX", "anchorY", "radius", "phase"]) {
    const food = [{ ...patch(), [field]: NaN }, patch()];
    api.consumeFoodAt(food, 100, 100, 0, 0.2);
    assert.equal(food[1].biomass, 0.8);
    const ctx = canvas();
    api.drawFoodField(ctx, food, 0);
    assert.equal(ctx.colors.length, 2);
    assert.ok(Number.isFinite(api.sampleFood(food, 100, 100, 0, config)));
  }
  for (const radius of [0, -1]) {
    const ctx = canvas();
    api.drawFoodField(ctx, [{ ...patch(), radius }], 0);
    assert.equal(ctx.colors.length, 0);
  }
});
