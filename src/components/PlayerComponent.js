import React from 'react';
import {Link} from 'react-router-dom';

const PlayerComponent = (props) => {

    return (
      <div id="player">
        <Link to="/start" onClick={props.resetSong}>Back</Link>
        <h3>Singer: {props.player}</h3>
        <h3>Next singer: {props.player}</h3>
        <p>{props.title}</p>
        <iframe 
          title="youtube"
          id="player-frame"
          width="500px"
          height="300px"
          src={props.source}
          frameBorder="0"
          allow=""
          allowFullScreen>
        </iframe>
        <br/>
        <button onClick={props.getSong}>New song</button>
      <button onClick={props.updateSong}>Update song {props.updateCounter}</button>
      </div>
    )
  }

export default PlayerComponent;