import { useState } from "react";
import "./styles/App.scss";
import Home from "./pages/Home.jsx";
import Sim from "./pages/Sim.jsx";
import Detail from "./pages/Detail.jsx";

function App() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [currentPage, setCurrentPage] = useState("home"); // home | sim | detail
  const [savedPosition, setSavedPosition] = useState(null);

  function onAnimalClick(e) {
    const animalId = e.currentTarget.dataset.speciesId || e.currentTarget.id;
    const instanceId = e.currentTarget.id;
    const el = e.currentTarget;

    // 현재 위치 저장
    const position = {
      x: parseFloat(el.style.left) || 0,
      y: parseFloat(el.style.top) || 0,
    };

    setSavedPosition({ animalId, instanceId, position });
    setSelectedAnimal(animalId);
    setCurrentPage("sim");
  }

  function onSimBackClick() {
    setCurrentPage("home");
  }

  function onSimDetailClick() {
    setCurrentPage("detail");
  }

  function onDetailBackClick() {
    setCurrentPage("sim");
  }

  return (
    <div className="app">
      {currentPage === "home" && (
        <Home onAnimalClick={onAnimalClick} savedPosition={savedPosition} />
      )}
      {currentPage === "sim" && (
        <Sim
          selectedAnimal={selectedAnimal}
          onBackClick={onSimBackClick}
          onDetailClick={onSimDetailClick}
        />
      )}
      {currentPage === "detail" && selectedAnimal && (
        <Detail animalId={selectedAnimal} onBackClick={onDetailBackClick} />
      )}
    </div>
  );
}

export default App;
