const behaviorModules = import.meta.glob(
  "../behaviors/individual/[0-9]*_*.jsx",
  { eager: true },
);

const camelToSnake = (str) => {
  return (
    str.charAt(0).toLowerCase() +
    str.slice(1).replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
  );
};

const ANIMAL_KOREAN_NAMES = {
  starling: "찌르레기",
  sardine: "정어리",
  grasshopper: "메뚜기",
  ant: "개미",
  bat: "박쥐",
  sheep: "양",
  penguin: "펭귄",
  bee: "꿀벌",
  firefly: "반딧불이",
  spiny_lobster: "닭새우",
  krill: "크릴",
};

const generateAnimalsData = () => {
  return Object.entries(behaviorModules)
    .map(([path, moduleExport]) => {
      const filename = path.split("/").pop().replace(".jsx", "");
      const match = filename.match(/^\d+_(.+)$/);
      if (!match) return null;

      const name = match[1];
      const id = camelToSnake(name);
      const behavior = moduleExport.default || moduleExport;
      const koreanName = ANIMAL_KOREAN_NAMES[id];

      return { path, id, name, koreanName: koreanName || name, behavior };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));
};

export const animalsData = generateAnimalsData();

export const behaviorMap = Object.fromEntries(
  animalsData.map((animal) => [animal.id, animal.behavior]),
);

export const animals = animalsData.map((animal) => ({
  id: animal.id,
  name: animal.koreanName,
}));
