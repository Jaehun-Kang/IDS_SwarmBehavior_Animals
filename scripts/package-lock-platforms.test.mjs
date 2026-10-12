import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { packages } = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const resolveDependency = (owner, name) => {
  for (let location = owner; ; ) {
    const entry = packages[`${location ? `${location}/` : ''}node_modules/${name}`];
    if (entry) return entry;
    if (!location) return null;
    const parent = location.lastIndexOf('/node_modules/');
    location = parent < 0 ? '' : location.slice(0, parent);
  }
};

test('native build tools include every declared platform binding', () => {
  for (const name of ['lightningcss', 'rolldown']) {
    const owner = `node_modules/${name}`;
    for (const [dependency, version] of Object.entries(packages[owner].optionalDependencies)) {
      const entry = resolveDependency(owner, dependency);
      assert(entry, `${dependency} missing from lockfile`);
      assert.equal(entry.version, version, dependency);
      assert(entry.integrity, `${dependency} missing integrity`);
    }
  }
});

test('both Mac architectures have native build dependencies', () => {
  for (const arch of ['arm64', 'x64']) {
    for (const [owner, name] of [
      ['lightningcss', `lightningcss-darwin-${arch}`],
      ['rolldown', `@rolldown/binding-darwin-${arch}`],
    ]) {
      const entry = resolveDependency(`node_modules/${owner}`, name);
      assert(entry?.os.includes('darwin'), name);
      assert(entry?.cpu.includes(arch), name);
    }
  }
});

test('fallback dependencies and fsevents remain resolvable', () => {
  const seen = new Set();
  const visit = (owner, name) => {
    const entry = resolveDependency(owner, name);
    assert(entry, `${owner} -> ${name} missing`);
    if (seen.has(entry)) return;
    seen.add(entry);
    const key = Object.keys(packages).find(key => packages[key] === entry);
    for (const child of Object.keys(entry.dependencies || {})) visit(key, child);
    for (const child of Object.keys(entry.peerDependencies || {})) {
      if (!entry.peerDependenciesMeta?.[child]?.optional) visit(key, child);
    }
  };
  visit('node_modules/rolldown', '@rolldown/binding-wasm32-wasi');
  assert(resolveDependency('node_modules/vite', 'fsevents'));
});
