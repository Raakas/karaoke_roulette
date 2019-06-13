import React from 'react';

const PlayerComponent = (props) => {
  
    return (
      <div id="player">
        <iframe 
        title="youtube"
        id="player-frame"
        width="560" 
        height="315" 
        src={props.source}
        frameBorder="0" 
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen>
        </iframe>
    </div>
    )
  }
  
export default PlayerComponent;