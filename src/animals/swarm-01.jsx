// 찌르레기 starling
import * as React from "react";
import { P5Canvas } from "@p5-wrapper/react";

function sketch(p5) {
  p5.setup = () => p5.createCanvas(p5.windowWidth, p5.windowHeight);

  p5.draw = () => {
    p5.background(250);
    p5.normalMaterial();
    p5.push();
    p5.rotateZ(p5.frameCount * 0.01);
    p5.rotateX(p5.frameCount * 0.01);
    p5.rotateY(p5.frameCount * 0.01);
    p5.plane(100);
    p5.pop();
  };
}

export function App() {
  return <P5Canvas sketch={sketch} />;
}
