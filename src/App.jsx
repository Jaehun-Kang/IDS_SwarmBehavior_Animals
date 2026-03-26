import { useRef } from "react";
import "./App.css";
import Home from "./Home.jsx";
import Sim from "./Sim.jsx";

function App() {
  const home = useRef(null);
  const sim = useRef(null);

  function onAnimalClick(e) {
    console.log(e.currentTarget.id);
    home.current.style.display = "none";
    sim.current.style.display = "block";
  }

  return (
    <div className="app">
      <Home ref={home} onAnimalClick={onAnimalClick} />
      <Sim ref={sim} />
    </div>
  );
}

export default App;
