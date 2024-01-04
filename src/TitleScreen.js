import './Styles.css'
import React from "react";
import Instructions from "./Instructions";
import Credits from "./Credits";


const TitleScreen = ({ onStartGame, onViewInstructions, onViewCredits }) => {
  return (
    <div className="menu-screen" id='title-page'>
      <h1 id='knightsweeper'></h1>
      <div className='button-group'>
        <button className="menu-button" id='play' onClick={onStartGame}></button>
        <button className="menu-button" id='instructions' onClick={onViewInstructions}></button>
        <button className="menu-button" id='credits' onClick={onViewCredits}></button>
      </div>
    </div>
  );
};

export default TitleScreen;