import { useState } from "react";
import "./styles/App.scss";
import Home from "./pages/Home.jsx";
import Sim from "./pages/Sim.jsx";
import Detail from "./pages/Detail.jsx";

const DETAIL_ENTER_DURATION = 400;

function App() {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [currentPage, setCurrentPage] = useState("home"); // home | sim | detail
  const [savedPosition, setSavedPosition] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

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
    setIsPaused(false);
  }

  function onSimBackClick() {
    setCurrentPage("home");
  }

  function onSimDetailClick() {
    setCurrentPage("detail");
  }

  function onDetailBackClick() {
    setIsPaused(false);
    setCurrentPage("sim");
  }

  function onDetailEnterComplete() {
    setIsPaused(true);
  }

  return (
    <div className="app">
      {currentPage === "home" && (
        <Home onAnimalClick={onAnimalClick} savedPosition={savedPosition} />
      )}
      {(currentPage === "sim" || currentPage === "detail") && (
        <Sim
          selectedAnimal={selectedAnimal}
          onBackClick={onSimBackClick}
          onDetailClick={onSimDetailClick}
          isPaused={isPaused}
        />
      )}
      {currentPage === "detail" && selectedAnimal && (
        <Detail
          animalId={selectedAnimal}
          enterDuration={DETAIL_ENTER_DURATION}
          onBackClick={onDetailBackClick}
          onEnterComplete={onDetailEnterComplete}
        />
      )}
    </div>
  );
}

export default App;
