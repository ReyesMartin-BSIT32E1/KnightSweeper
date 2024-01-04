import React from "react";

const Instructions = ({ onBack }) => {
  return (
    <div className="menu-screen">
      <h1 id="instructions"></h1>
      <img src="./sprites/Instructions-Page.png" style={{width: "clamp(768px, 60%, 60%)",}}/>
      <button className='back-button' onClick={onBack}>◀</button>
    </div>
  );
};

export default Instructions;