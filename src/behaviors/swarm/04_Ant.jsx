// 개미 ant
import * as React from "react";
import { P5Canvas } from "@p5-wrapper/react";

export function App() {
  const p5InstanceRef = React.useRef(null);
  const key = 0;

  const sketch = React.useCallback((p5) => {
    p5InstanceRef.current = p5;

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    };

    p5.draw = () => {
      p5.background(250);
      p5.normalMaterial();
      p5.push();
      p5.rotateZ(p5.frameCount * 0.005);
      p5.rotateX(p5.frameCount * 0.015);
      p5.rotateY(p5.frameCount * 0.01);
      p5.cone(70, 100);
      p5.pop();
      p5.circle(p5.mouseX - p5.width * 0.5, p5.mouseY - p5.height * 0.5, 100);
    };

    p5.windowResized = () => {
      if (p5InstanceRef.current) {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      }
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (p5InstanceRef.current) {
        try {
          p5InstanceRef.current.remove();
        } catch {
          // 무시
        }
      }

      const canvases = document.querySelectorAll("canvas");
      canvases.forEach((canvas) => {
        try {
          const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
          if (gl) {
            const ext = gl.getExtension("WEBGL_lose_context");
            if (ext) ext.loseContext();
          }
        } catch {
          // 무시
        }
      });
    };
  }, []);

  return <P5Canvas key={key} sketch={sketch} />;
}
