import antSpriteSheetUrl from "../assets/ant_1.svg";
import batSpriteSheetUrl from "../assets/bat_1.svg";
import beeSpriteSheetUrl from "../assets/bee_1.svg";
import fireflySpriteSheetUrl from "../assets/firefly_1.svg";
import grasshopperSpriteSheetUrl from "../assets/grasshopper_1.svg";
import krillSpriteSheetUrl from "../assets/krill_1.svg";
import penguinSpriteSheetUrl from "../assets/penguin_1.svg";
import sardineSpriteSheetUrl from "../assets/sardine_1.svg";
import sheepSpriteSheetUrl from "../assets/sheep_1.svg";
import spinyLobsterSpriteSheetUrl from "../assets/spinylobster_1.svg";
import starlingSpriteSheetUrl from "../assets/starling_1.svg";

export const HOME_SPRITE_ATLASES = {
  starling: {
    space: "3d",
    src: starlingSpriteSheetUrl,
    imageSize: { width: 660, height: 110 },
    aspectRatio: "1",
    grid: { columns: 6, rows: 1 },
    baseClassName: "sprite_starling",
    defaultStage: "starling_fly1",
    pose: {
      type: "side_top_mirror_rotate",
      state: ({ motion, options, state }) => {
        const threshold = Number.isFinite(options?.verticalThreshold)
          ? options.verticalThreshold
          : 1;
        const shouldLockVariant =
          motion.facingY === "down" && motion.verticalRatio <= threshold;
        const nextState = {
          spriteVariant:
            typeof state?.spriteVariant === "number"
              ? state.spriteVariant
              : Math.random(),
          spriteBranchLock: Boolean(state?.spriteBranchLock),
        };

        if (!shouldLockVariant) {
          nextState.spriteBranchLock = false;
          return nextState;
        }

        if (!nextState.spriteBranchLock) {
          nextState.spriteVariant = Math.random();
          nextState.spriteBranchLock = true;
        }

        return nextState;
      },
      stages: {
        sideUp: "starling_fly1",
        sideDown: ({ state }) =>
          state?.spriteVariant > 0.5 ? "starling_fly2" : "starling_fly3",
        topUp: "starling_fly4",
        topDown: "starling_fly5",
      },
      options: {
        verticalThreshold: 0.95,
        rotateSide: true,
        rotateVertical: true,
      },
    },
    stages: {
      starling_fly1: {
        type: "animation",
        frames: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        durationMs: 100,
      },
      starling_fly2: { frame: { x: 2, y: 0 } },
      starling_fly3: { frame: { x: 3, y: 0 } },
      starling_fly4: {
        type: "animation",
        frames: [
          { x: 4, y: 0 },
          { x: 5, y: 0 },
        ],
        durationMs: 100,
      },
      starling_fly5: { frame: { x: 4, y: 0 } },
    },
  },
  sardine: {
    space: "3d",
    src: sardineSpriteSheetUrl,
    imageSize: { width: 450, height: 50 },
    aspectRatio: "150 / 50",
    grid: { columns: 3, rows: 1 },
    baseClassName: "sprite_sardine",
    defaultStage: "sardine_swim1",
    pose: {
      type: "side_front_back",
      stages: {
        side: "sardine_swim1",
        front: "sardine_swim2",
        back: "sardine_swim3",
      },
      options: {
        rotateSide: true,
        rotateVertical: false,
      },
    },
    stages: {
      sardine_swim1: { frame: { x: 0, y: 0 } },
      sardine_swim2: { frame: { x: 1, y: 0 } },
      sardine_swim3: { frame: { x: 2, y: 0 } },
    },
  },
  grasshopper: {
    space: "3d",
    src: grasshopperSpriteSheetUrl,
    imageSize: { width: 575, height: 110 },
    aspectRatio: "115 / 110",
    grid: { columns: 5, rows: 1 },
    baseClassName: "sprite_grasshopper",
    defaultStage: "grasshopper_idle",
    pose: {
      resolve: ({ motion, state, options }) => {
        const directionX = state?.directionX ?? motion.screenVelocity.x;
        const directionY = state?.directionY ?? motion.screenVelocity.y;
        const directionLength = Math.hypot(directionX, directionY) || 1;
        const directionRatio = Math.abs(directionY) / directionLength;
        const directionAngle = Math.atan2(directionY, directionX || 1);
        let rotation = directionAngle;
        let flipX = 1;

        if (Math.abs(rotation) > Math.PI * 0.5) {
          flipX = -1;
          rotation = rotation > 0 ? rotation - Math.PI : rotation + Math.PI;
        }

        if (state?.isJumping) {
          return {
            stage:
              state.jumpProgress < 0.3 ? "grasshopper_jump" : "grasshopper_fly",
            rotation,
            flipX,
          };
        }

        if (directionRatio >= (options?.idleFrontThreshold ?? 0.9)) {
          return {
            stage: "grasshopper_idle_front",
            rotation: 0,
            flipX: 1,
          };
        }

        return {
          stage: "grasshopper_idle",
          rotation: 0,
          flipX: directionX < 0 ? -1 : 1,
        };
      },
      options: {
        idleFrontThreshold: 0.9,
      },
    },
    stages: {
      grasshopper_idle: { frame: { x: 0, y: 0 } },
      grasshopper_idle_front: { frame: { x: 1, y: 0 } },
      grasshopper_jump: { frame: { x: 2, y: 0 } },
      grasshopper_fly: {
        type: "animation",
        frames: [
          { x: 3, y: 0 },
          { x: 4, y: 0 },
        ],
        durationMs: 50,
      },
    },
  },
  ant: {
    space: "2d",
    src: antSpriteSheetUrl,
    imageSize: { width: 300, height: 44 },
    aspectRatio: "100 / 44",
    grid: { columns: 3, rows: 1 },
    baseClassName: "sprite_ant",
    defaultStage: "ant_top",
    pose: {
      resolve: ({ motion, state, options, profile }) => {
        const forceTop =
          profile === "home" ||
          profile === "simulation" ||
          profile === "swarm" ||
          Boolean(state?.bridgeLock);

        if (forceTop) {
          return {
            stage: "ant_top",
            orientation: "top",
            rotation: motion.rawAngle,
            flipX: 1,
          };
        }

        if (motion.verticalRatio > (options?.frontThreshold ?? 0.82)) {
          return {
            stage: "ant_front",
            orientation: "front",
            rotation: 0,
            flipX: 1,
          };
        }

        return {
          stage: "ant_walk",
          rotation: 0,
          flipX: motion.flipX,
        };
      },
      options: {
        frontThreshold: 0.82,
      },
    },
    stages: {
      ant_walk: { frame: { x: 0, y: 0 } },
      ant_front: { frame: { x: 1, y: 0 } },
      ant_top: { frame: { x: 2, y: 0 } },
    },
  },
  bat: {
    space: "3d",
    src: batSpriteSheetUrl,
    imageSize: { width: 380, height: 215 },
    aspectRatio: "95 / 215",
    grid: { columns: 4, rows: 1 },
    baseClassName: "sprite_bat",
    defaultStage: "bat_fly1",
    pose: {
      type: "side_top_mirror_rotate",
      stages: {
        side: "bat_fly1",
        topUp: "bat_fly2",
        topDown: "bat_fly3",
      },
      options: {
        verticalThreshold: 0.95,
        rotateSide: true,
        rotateVertical: true,
      },
    },
    stages: {
      bat_fly1: {
        type: "animation",
        frames: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        durationMs: 120,
      },
      bat_fly2: {
        type: "animation",
        frames: [
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
        durationMs: 120,
      },
      bat_fly3: { frame: { x: 2, y: 0 } },
    },
  },
  sheep: {
    space: "2d",
    src: sheepSpriteSheetUrl,
    imageSize: { width: 345, height: 75 },
    aspectRatio: "115 / 75",
    grid: { columns: 3, rows: 1 },
    baseClassName: "sprite_sheep",
    defaultStage: "sheep_walk",
    pose: {
      type: "side_front_back",
      stages: {
        side: "sheep_walk",
        front: "sheep_front",
        back: "sheep_back",
      },
      options: {
        rotateSide: false,
        rotateVertical: false,
      },
    },
    stages: {
      sheep_walk: { frame: { x: 0, y: 0 } },
      sheep_front: { frame: { x: 1, y: 0 } },
      sheep_back: { frame: { x: 2, y: 0 } },
    },
  },
  penguin: {
    space: "2d",
    src: penguinSpriteSheetUrl,
    imageSize: { width: 135, height: 85 },
    aspectRatio: "45 / 85",
    grid: { columns: 3, rows: 1 },
    baseClassName: "sprite_penguin",
    defaultStage: "penguin_walk",
    pose: {
      type: "side_front_back",
      stages: {
        side: "penguin_walk",
        front: "penguin_front",
        back: "penguin_back",
      },
      options: {
        rotateSide: false,
        rotateVertical: false,
      },
    },
    stages: {
      penguin_walk: { frame: { x: 0, y: 0 } },
      penguin_front: { frame: { x: 1, y: 0 } },
      penguin_back: { frame: { x: 2, y: 0 } },
    },
  },
  bee: {
    space: "3d",
    src: beeSpriteSheetUrl,
    imageSize: { width: 600, height: 150 },
    aspectRatio: "100 / 150",
    grid: { columns: 6, rows: 1 },
    baseClassName: "sprite_bee",
    defaultStage: "bee_fly",
    pose: {
      type: "side_top_mirror_rotate",
      stages: {
        side: "bee_fly",
        top: "bee_top_fly",
      },
      options: {
        verticalThreshold: 0.95,
        rotateSide: true,
        rotateVertical: true,
      },
    },
    stages: {
      bee_fly: {
        type: "animation",
        frames: [
          { x: 4, y: 0 },
          { x: 5, y: 0 },
        ],
        durationMs: 50,
      },
      bee_top_fly: {
        type: "animation",
        frames: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
        durationMs: 50,
      },
    },
  },
  firefly: {
    space: "3d",
    src: fireflySpriteSheetUrl,
    imageSize: { width: 810, height: 320 },
    aspectRatio: "135 / 160",
    grid: { columns: 6, rows: 2 },
    baseClassName: "sprite_firefly",
    defaultStage: "firefly_glow",
    pose: {
      type: "side_top_mirror_rotate",
      stages: {
        side: ({ state }) => (state?.glow ? "firefly_glow" : "firefly_dark"),
        top: ({ state }) =>
          state?.glow ? "firefly_lit_top_fly" : "firefly_dark_top_fly",
      },
      options: {
        verticalThreshold: 0.95,
        rotateSide: true,
        rotateVertical: true,
      },
    },
    stages: {
      firefly_glow: {
        type: "animation",
        frames: [
          { x: 4, y: 0 },
          { x: 5, y: 0 },
        ],
        durationMs: 35,
      },
      firefly_dark: {
        type: "animation",
        frames: [
          { x: 4, y: 1 },
          { x: 5, y: 1 },
        ],
        durationMs: 35,
      },
      firefly_lit_top_fly: {
        type: "animation",
        frames: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
        durationMs: 70,
      },
      firefly_dark_top_fly: {
        type: "animation",
        frames: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
        durationMs: 70,
      },
    },
  },
  spiny_lobster: {
    space: "2d",
    src: spinyLobsterSpriteSheetUrl,
    imageSize: { width: 660, height: 180 },
    aspectRatio: "165 / 180",
    grid: { columns: 4, rows: 1 },
    baseClassName: "sprite_spiny_lobster",
    defaultStage: "lobster_swim",
    pose: {
      resolve: ({ motion, state }) => {
        if (state?.forceTop) {
          return {
            stage: "lobster_top",
            orientation: "top",
            rotation: 0,
            flipX: 1,
          };
        }

        return {
          stage: "lobster_swim",
          rotation: 0,
          flipX: motion.flipX,
        };
      },
    },
    stages: {
      lobster_swim: {
        type: "animation",
        frames: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        durationMs: 800,
      },
      lobster_top: {
        type: "animation",
        frames: [
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
        durationMs: 800,
      },
    },
  },
  krill: {
    space: "2d",
    src: krillSpriteSheetUrl,
    imageSize: { width: 290, height: 75 },
    aspectRatio: "145 / 75",
    grid: { columns: 2, rows: 1 },
    baseClassName: "sprite_krill",
    defaultStage: "krill_swim",
    pose: {
      type: "side_front_back",
      stages: {
        side: "krill_swim",
        front: "krill_front",
        back: "krill_front",
      },
      options: {
        rotateSide: false,
        rotateVertical: false,
      },
    },
    stages: {
      krill_swim: { frame: { x: 0, y: 0 } },
      krill_front: { frame: { x: 1, y: 0 } },
    },
  },
};

export const SPRITE_ATLASES = HOME_SPRITE_ATLASES;
