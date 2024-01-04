import React from "react";

const Credits = ({ onBack }) => {
  return (
    <div className="menu-screen">
      <h1 id="credits"></h1>
      <p style={{height: "max-content", lineHeight: "3rem", fontWeight: "Bold", margin: "0px 0px calc(100vh - (15rem + clamp(64px, 4vw, 4vw) + clamp(1vw, 16px, 100%) * 2)) 0px"}}>KnightSweeper, A simple game where you clear a minefield with Chess knight movements<br/>Arciaga, Justin Ritchie - Web Formatting, UI Design<br/>Garcia, Mark Angelo - Level Design, Graphics<br/>Reyes, Martin Tristan - Coding, Conceptualization<br/>Rodejo, Varon Ian - Debugging, Testing<br/>Salazar, Gabriel Angelo - Debugging, Web Formatting</p>
      <button className='back-button' onClick={onBack}>◀</button>
    </div>
  );
};

export default Credits;