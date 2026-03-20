import { useState, useRef } from "react";
import "./App.css";

function App() {
  const main = useRef(null);
  const sim = useRef(null);

  function onAnimalClick(e) {
    console.log(e.currentTarget.id);
    main.current.style.display = "none";
    sim.current.display = "block";
  }

  return (
    <div className="app">
      <div className="main" ref={main}>
        <h1>
          Swarm
          <br />
          Behavior
        </h1>

        <div onClick={onAnimalClick} className="creature" id="starling">
          <p>찌르레기</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="sardine">
          <p>정어리</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="grasshopper">
          <p>메뚜기</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="ant">
          <p>개미</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="bat">
          <p>박쥐</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="sheep">
          <p>양</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="bee">
          <p>꿀벌</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="firefly">
          <p>반딧불이</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="spiny_lobster">
          <p>닭새우</p>
        </div>
        <div onClick={onAnimalClick} className="creature" id="krill">
          <p>크릴</p>
        </div>
      </div>
      <div className="sim" ref={sim}></div>
    </div>
  );
}

export default App;
