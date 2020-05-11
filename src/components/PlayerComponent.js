import React from 'react';
import {Link} from 'react-router-dom';

const PlayerComponent = (props) => {

    return (
      <div id="player">
        <Link to="/start">Back</Link>
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
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen>
        </iframe>
        <button onClick={props.newSong}>New song</button>
      </div>
    )
  }

export default PlayerComponent;