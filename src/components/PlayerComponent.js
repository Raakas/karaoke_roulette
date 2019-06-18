import React from 'react';

const PlayerComponent = (props) => {
  
    return (
      <div id="player">
      <h1>Karaoke Roulette</h1>
      <h3>Singer: {props.singer1}</h3>
      <h3>Next singer: {props.singer2}</h3>
      <p>{props.title}</p>
        <iframe 
          title="youtube"
          id="player-frame"
          width="500px" 
          height="300px"
          src={props.source}
          frameBorder="0" 
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen>
        </iframe>
        <button id="play-button" onClick={props.play}>Play</button>
      </div>
    )
  }
  
export default PlayerComponent;