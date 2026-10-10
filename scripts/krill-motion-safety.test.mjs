import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/behaviors/swarm/11_Krill.jsx", import.meta.url), "utf8");
const context = vm.createContext({ ATLAS: {} });
vm.runInContext(
  source.slice(source.indexOf("const DIRECT_FINDING_PARAMS ="), source.indexOf("export function App(")) +
    ";globalThis.api = { PARAMS, createAgents, advanceAgent, resolveBehaviorConfig, resolvePhaseFlags, calculateSwarmCenter, calculateDensityGradientCohesion, createNeighborGrid, updateNeighborGrid, gatherNeighbors, resolveTopologicalNeighbors };",
  context,
);
const api = context.api;
const finiteMotion = agent => [agent.x, agent.y, agent.vx, agent.vy, agent.heading].every(Number.isFinite);

test("spatial queries preserve exhaustive neighbors and their order after moves", () => {
  const agents = Array.from({ length: 180 }, (_, id) => ({
    id, x: (id * 137) % 2100 - 150, y: (id * 71) % 1200 - 150,
    isParachuting: id % 7 === 0,
  }));
  agents[1].x = agents[0].x;
  agents[1].y = agents[0].y;
  agents[2].x = agents[0].x + api.PARAMS.PERCEPTION_RADIUS_PX;
  agents[2].y = agents[0].y;
  const grid = api.createNeighborGrid(agents);
  for (let frame = 0; frame < 4; frame++) {
    agents.forEach((agent, index) => {
      assert.deepEqual(api.gatherNeighbors(agents, index, grid), api.gatherNeighbors(agents, index));
      agent.x += index % 2 ? 175 : -175;
      agent.y -= 160;
      agent.isParachuting = !agent.isParachuting;
      api.updateNeighborGrid(grid, agent, index);
    });
  }
  agents[1].x = NaN;
  api.updateNeighborGrid(grid, agents[1], 1);
  assert.equal(api.gatherNeighbors(agents, 1, grid).length, 0);
  agents[1].x = 0;
  api.updateNeighborGrid(grid, agents[1], 1);
  assert.deepEqual(api.gatherNeighbors(agents, 1, grid), api.gatherNeighbors(agents, 1));
});

test("nearest selection preserves stable full-sort results including distance ties", () => {
  const neighbors = Array.from({ length: 100 }, (_, id) => ({ id, distance: (id * 17) % 13 }));
  for (let count = 0; count <= neighbors.length; count++) {
    const sample = neighbors.slice(0, count);
    assert.deepEqual(Array.from(api.resolveTopologicalNeighbors(sample)),
      sample.slice().sort((a, b) => a.distance - b.distance).slice(0, api.PARAMS.TOPOLOGICAL_NEIGHBOR_COUNT));
  }
});

test("sequential simulation is identical with and without the spatial index", () => {
  const seed = api.createAgents(60, 800, 600);
  seed[1].x = seed[0].x;
  seed[1].y = seed[0].y;
  const simulate = indexed => {
    const agents = structuredClone(seed);
    // Repeat the same noise sequence for both simulation runs.
    vm.runInContext('Math.random = (() => { let seed = 123; return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); })()', context);
    for (let frame = 0; frame < 90; frame++) {
      const phase = ['day', 'sunset', 'night'][Math.floor(frame / 30)];
      const state = {
        dt: 1 / 60, width: 800, height: 600, elapsedS: frame / 60,
        timeFlags: api.resolvePhaseFlags(phase, null, frame / 60),
        foodField: [], config: api.resolveBehaviorConfig(),
        swarmCenter: api.calculateSwarmCenter(agents),
        predatorPointer: { active: frame % 10 < 5, x: 400, y: 300 },
        neighborGrid: indexed ? api.createNeighborGrid(agents) : undefined,
      };
      agents.forEach((agent, index) => {
        api.advanceAgent(agent, index, agents, state);
        if (indexed) api.updateNeighborGrid(state.neighborGrid, agent, index);
      });
    }
    assert.ok(agents.every(finiteMotion));
    return agents;
  };
  assert.deepEqual(simulate(true), simulate(false));
});

test("overlapping neighbors do not produce an invalid cohesion force", () => {
  const force = api.calculateDensityGradientCohesion([{ dx: 0, dy: 0, distance: 0 }], 54);
  assert.ok(Number.isFinite(force.x) && Number.isFinite(force.y));
});

test("overlap cannot erase swimmers or a sinking agent returning to swimming", () => {
  const agents = api.createAgents(8, 800, 600);
  agents.forEach((agent, i) => { agent.x = 200 + i * 25; agent.y = 200; });
  agents[1].x = agents[0].x;
  const sinking = agents.at(-1);
  sinking.isParachuting = true;
  sinking.parachuteTime = api.PARAMS.PARACHUTE_DURATION_S - 0.1;
  sinking.parachuteTargetY = 400;
  for (let frame = 0; frame < 120; frame++) {
    const state = {
      dt: 1 / 60, width: 800, height: 600, elapsedS: frame / 60,
      timeFlags: api.resolvePhaseFlags("day", null, frame / 60),
      foodField: [], config: api.resolveBehaviorConfig(),
      swarmCenter: api.calculateSwarmCenter(agents), predatorPointer: null,
    };
    agents.forEach((agent, index) => api.advanceAgent(agent, index, agents, state));
    assert.ok(agents.every(finiteMotion), `invalid motion at frame ${frame}`);
  }
  assert.equal(sinking.isParachuting, false);
});

test("invalid positions cannot poison the shared swarm center", () => {
  const center = api.calculateSwarmCenter([{ x: 10, y: 20 }, { x: NaN, y: 40 }]);
  assert.equal(center.x, 10);
  assert.equal(center.y, 20);
  assert.equal(api.calculateSwarmCenter([{ x: Infinity, y: 0 }]), null);
});
