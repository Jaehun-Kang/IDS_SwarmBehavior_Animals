import { useState } from "react";
import "./styles/App.css";
import Home from "./pages/Home.jsx";
import Sim from "./pages/Sim.jsx";

function App() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [savedPosition, setSavedPosition] = useState(null);

  function onAnimalClick(e) {
    const animalId = e.currentTarget.id;
    const el = e.currentTarget;

    // 현재 위치 저장
    const position = {
      x: parseFloat(el.style.left) || 0,
      y: parseFloat(el.style.top) || 0,
    };

    setSavedPosition({ animalId, position });
    setSelectedAnimal(animalId);
  }

  function onBackClick() {
    setSelectedAnimal(null);
  }

  return (
    <div className="app">
      {selectedAnimal === null ? (
        <Home onAnimalClick={onAnimalClick} savedPosition={savedPosition} />
      ) : (
        <Sim selectedAnimal={selectedAnimal} onBackClick={onBackClick} />
      )}
    </div>
  );
}

export default App;
