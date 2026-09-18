import React from "react";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas, resolveStageFrameSequence } from "../../utils/spriteAtlas";
import { createStarlingShape, advanceStarlingShape, starlingShapePoint } from "./starlingShapeModel.js";

export default function StarlingShapePreview({ controls, ruleGroup }) {
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let disposed = false, renderer, geometry, meshes = [], textures = [], loop;
    const model = createStarlingShape();
    const atlas = HOME_SPRITE_ATLASES.starling;
    Promise.all([import("three"), loadTexturedAtlasCanvas(atlas)]).then(([THREE, result]) => {
      if (disposed) return;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setClearColor(0, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-12, 12, 12, -12, 0.1, 100);
      geometry = new THREE.PlaneGeometry(0.5, 0.5);
      const sequences = ["starling_fly1", "starling_fly4"].map(stage =>
        resolveStageFrameSequence(atlas, stage).frames);
      let topView = model.angle >= 45;
      textures = sequences.flat().map(frame => {
        const image = getAtlasFrameCanvas(result.frameCanvases, frame);
        if (!image) throw new Error("starling-shape-frame-missing");
        const texture = new THREE.CanvasTexture(image);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      });
      meshes = textures.map(map => {
        const material = new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.15, side: THREE.DoubleSide });
        const mesh = new THREE.InstancedMesh(geometry, material, model.seeds.length);
        mesh.frustumCulled = false;
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(mesh);
        return mesh;
      });
      const object = new THREE.Object3D(), point = {};
      loop = createBookCanvasLoop(canvasRef.current, {
        onResize: ({ width, height }) => {
          renderer.setPixelRatio(window.devicePixelRatio || 1);
          renderer.setSize(width, height, false);
          const aspect = width / height, span = Math.max(23, aspect * 14);
          camera.left = -span / 2; camera.right = span / 2;
          camera.top = span / aspect / 2; camera.bottom = -camera.top;
          camera.updateProjectionMatrix();
        },
        onFrame: ({ context, width, height, elapsedSeconds }) => {
          advanceStarlingShape(model, controlsRef.current, elapsedSeconds);
          const angle = model.angle * Math.PI / 180;
          camera.position.set(0, Math.sin(angle) * 30, Math.cos(angle) * 30);
          camera.lookAt(0, 0, 0);
          camera.updateMatrixWorld();
          // Hysteresis avoids flickering between views near the transition angle.
          if (model.angle >= 50) topView = true;
          else if (model.angle <= 40) topView = false;
          const frameCount = sequences[topView ? 1 : 0].length;
          const frameOffset = topView ? sequences[0].length : 0;
          for (let i = 0; i < model.seeds.length; i++) {
            starlingShapePoint(model, i, point);
            object.position.set(point.x, point.y, point.z);
            object.quaternion.copy(camera.quaternion);
            const frame = frameOffset + Math.floor(model.time * 6 + i * 0.37) % frameCount;
            for (let j = 0; j < meshes.length; j++) {
              object.scale.setScalar(j === frame ? 1 : 0);
              object.updateMatrix();
              meshes[j].setMatrixAt(i, object.matrix);
            }
          }
          for (const mesh of meshes) mesh.instanceMatrix.needsUpdate = true;
          renderer.render(scene, camera);
          context.clearRect(0, 0, width, height);
          context.drawImage(renderer.domElement, 0, 0, width, height);
        },
      });
      loop.start();
    }).catch(() => { if (!disposed) setError("무리의 모양을 불러오지 못했습니다."); });
    return () => {
      disposed = true;
      loop?.dispose();
      meshes.forEach(mesh => mesh.material.dispose());
      textures.forEach(texture => texture.dispose());
      geometry?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, []);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 입체 도식`}>
    {error ? <span role="alert">{error}</span> : null}
    <canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}
