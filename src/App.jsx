// import { useState } from "react";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header>
        <h1>타이틀</h1>
      </header>
      <main>
        <div className="creature starling">찌르레기</div>
        <div className="creature sardine">정어리</div>
        <div className="creature grasshopper">메뚜기</div>
        <div className="creature ant">개미</div>
        <div className="creature bat">박쥐</div>
        <div className="creature sheep">양</div>
        <div className="creature bee">꿀벌</div>
        <div className="creature firefly">반딧불이</div>
        <div className="creature spiny-lobster">닭새우</div>
        <div className="creature krill">크릴</div>
        <div className="creature wolf">늑대</div>
      </main>
    </div>
  );
}

export default App;
