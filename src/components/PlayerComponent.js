import React from 'react';
import {Link} from 'react-router-dom';

const PlayerComponent = (props) => {

    return (
      <div className="player">
        <Link to="/start" onClick={props.resetSong} className="align-left">Back</Link>
        <h2>{props.title}</h2>
        <iframe 
          title="youtube"
          id="player-frame"
          src={props.source}
          frameBorder="0"
          allow=""
          allowFullScreen>
        </iframe>
        <br/>
        <div className="buttons">
          <button className="button button-green" onClick={props.getSongFromDatabase}>New song</button>
          <button className="button button-blue" onClick={props.updateSong}>Update {props.updateCounter}</button>
        </div>
      </div>
    )
  }

export default PlayerComponent;