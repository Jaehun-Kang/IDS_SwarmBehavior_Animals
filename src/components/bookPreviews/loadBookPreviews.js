const loaders = {
  starling: () => import('./groups/starling.js'),
  sardine: () => import('./groups/sardine.js'),
  grasshopper: () => import('./groups/grasshopper.js'),
  ant: () => import('./groups/ant.js'),
  bat: () => import('./groups/bat.js'),
  sheep: () => import('./groups/sheep.js'),
  penguin: () => import('./groups/penguin.js'),
  bee: () => import('./groups/bee.js'),
  firefly: () => import('./groups/firefly.js'),
  spiny_lobster: () => import('./groups/spiny_lobster.js'),
  krill: () => import('./groups/krill.js'),
};
const pending = new Map();
const loaded = new Map();

export const getLoadedBookPreviews = animalId => loaded.get(animalId);

export function loadBookPreviews(animalId) {
  if (!loaders[animalId]) return Promise.reject(new Error(`Unknown book animal: ${animalId}`));
  if (!pending.has(animalId)) {
    pending.set(animalId, loaders[animalId]().then(module => {
      loaded.set(animalId, module);
      return module;
    }).catch(error => {
      pending.delete(animalId);
      throw error;
    }));
  }
  return pending.get(animalId);
}
