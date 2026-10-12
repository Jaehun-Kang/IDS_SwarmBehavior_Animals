import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "espree";

const names = ["01_Starling", "02_Sardine", "06_Sheep", "07_Penguin", "10_SpinyLobster"];
const files = new Map(names.map((name) => {
  const source = readFileSync(new URL(`../src/behaviors/swarm/${name}.jsx`, import.meta.url), "utf8");
  const ast = parse(source, {
    ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true }, range: true,
  });
  const declarations = new Map(ast.body.flatMap((node) => node.type === "VariableDeclaration"
    ? node.declarations.map((declaration) => [declaration.id.name, declaration.init]) : []));
  return [name, { source, ast, declarations }];
}));

function expression(name, key, context = {}) {
  const { source, declarations } = files.get(name);
  const node = declarations.get(key);
  assert.ok(node, `${name}: missing ${key}`);
  return new Function(...Object.keys(context), `return (${source.slice(...node.range)});`)(...Object.values(context));
}

function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) <= 2e-12 * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
}

for (const name of names) {
  test(`${name}: 60 Hz response unchanged, equal-time smoothing and survival agree`, () => {
    const blend = expression(name, "frameBlend");
    for (const amount of [0, 0.00032, 0.004, 0.0052, 0.036, 0.06, 0.08, 0.1, 0.18, 0.24, 0.28, 0.72, 0.97, 1]) {
      assert.equal(blend(amount, 1 / 60), amount);
      assert.equal(blend(amount, 0), 0);
      for (const hz of [5, 30, 60, 120, 144]) {
        let value = 0, survival = 1;
        for (let frame = 0; frame < hz; frame++) {
          const response = blend(amount, 1 / hz);
          value += (1 - value) * response;
          survival *= 1 - response;
        }
        close(value, 1 - Math.pow(1 - amount, 60));
        close(survival, Math.pow(1 - amount, 60));
      }
    }
  });
}

test("actual damping expressions retain the same velocity over one second", () => {
  let count = 0;
  for (const [name, { source, ast }] of files) {
    const params = {
      DRAG: 0.984, VELOCITY_DAMPING_STATIONARY: 0.72,
      VELOCITY_DAMPING: name === "07_Penguin" ? 0.88 : 0.985,
      REST_VELOCITY_DAMPING: 0.97,
    };
    function visit(node) {
      if (!node || typeof node !== "object") return;
      if (node.type === "CallExpression" && node.callee.type === "MemberExpression" &&
        node.callee.object.name === "Math" && node.callee.property.name === "pow" &&
        source.slice(...node.arguments[1].range) === "dt * 60") {
        const base = source.slice(...node.arguments[0].range);
        if (base.includes("DAMPING") || base.includes("DRAG") || base === "0.84" || base === "0.82") {
          count++;
          const retention = new Function("PARAMS", "dt", `return ${source.slice(...node.range)};`);
          const expected = Math.pow(retention(params, 1 / 60), 60);
          for (const hz of [5, 30, 60, 120, 144]) {
            close(Math.pow(retention(params, 1 / hz), hz), expected);
          }
        }
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === "range") continue;
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === "object") visit(value);
      }
    }
    visit(ast);
  }
  assert.equal(count, 10);
});

test("sardine active-signal decay uses elapsed time in the actual state helper", () => {
  const name = "02_Sardine";
  const frameBlend = expression(name, "frameBlend");
  const resolve = expression(name, "resolveBoidState", {
    frameBlend, lerp: (a, b, t) => a + (b - a) * t,
    PARAMS: { LARGE_TURN_THRESHOLD: 0.2, LARGE_TURN_MAX: 1.2 },
  });
  for (const hz of [30, 60, 120, 144]) {
    const boid = { activeSignal: 1, recentTurnAngle: 0, stateExpiresAt: 0, state: "normal" };
    for (let i = 0; i < hz; i++) resolve(boid, [], { intensity: 0 }, i / hz, {}, 1 / hz);
    close(boid.activeSignal, Math.pow(0.82, 60));
  }
});

test("sardine leader event gate uses the converted probability and preserves 60 Hz", () => {
  const name = "02_Sardine";
  const frameBlend = expression(name, "frameBlend");
  let randomValue = 0;
  const fakeMath = Object.create(Math);
  fakeMath.random = () => randomValue;
  const entered = new Error("entered event body");
  const trigger = expression(name, "maybeTriggerLeaderTurn", {
    frameBlend, Math: fakeMath,
    randomBetween: () => { throw entered; },
    normalize3D: () => { throw entered; },
  });
  for (const hz of [30, 60, 120, 144]) {
    const probability = frameBlend(0.0052, 1 / hz);
    randomValue = probability * 0.5;
    assert.throws(() => trigger({ isLeader: true, direction: { x: 1, y: 0, z: 0 } },
      { night: 0 }, 0, false, 1 / hz), (error) => error === entered);
    randomValue = probability + 0.01;
    assert.doesNotThrow(() => trigger({ isLeader: true }, { night: 0 }, 0, false, 1 / hz));
  }
});

test("continuous shelter-memory reinforcement is elapsed-time based", () => {
  const remember = expression("10_SpinyLobster", "rememberShelterVisit", {
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    PARAMS: { MEMORY_FIDELITY_DEFAULT: 0.95, MEMORY_FIDELITY_MIN: 0.1 },
  });
  for (const hz of [30, 60, 120, 144]) {
    const agent = { memoryFidelity: 0.1, spatialMemory: [] };
    for (let i = 0; i < hz / 2; i++) remember(agent, { id: 1, x: 2, y: 3 }, 60 / hz);
    close(agent.memoryFidelity, 0.7);
  }
});

test("owned loops have no interpolation capture and preserve paused drawing gates", () => {
  for (const [name, { source }] of files) {
    assert.doesNotMatch(source, /frame\.capture\(/, name);
    assert.equal((source.match(/frame\.advance\(/g) || []).length, 1, name);
    assert.match(source, /createPausedFrameGate/, name);
  }
});
