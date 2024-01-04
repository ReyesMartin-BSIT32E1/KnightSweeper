import React, { useState } from "react";
import Game from "./Game";
import TitleScreen from "./TitleScreen";
import Instructions from "./Instructions";
import Credits from "./Credits";

function App() {
  const [screen, setScreen] = useState("title");

  const startGame = () => {
    setScreen("game");
  };

  const viewInstructions = () => {
    setScreen("instructions");
  };

  const viewCredits = () => {
    setScreen("credits");
  };

  const goBack = () => {
    setScreen("title");
  };

  return (
    <div className="App">
      {screen === "game" && <Game onBack={goBack}/>}
      {screen === "title" && (
        <TitleScreen
          onStartGame={startGame}
          onViewInstructions={viewInstructions}
          onViewCredits={viewCredits}
        />
      )}
      {screen === "instructions" && <Instructions onBack={goBack}/>}
      {screen === "credits" && <Credits onBack={goBack}/>}
    </div>
  );
}

export default App;