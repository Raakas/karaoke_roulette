import React from 'react';
import {Link} from 'react-router-dom';

const PlayerComponent = (props) => {

    return (
      <div className="player">
        <p>{props.currentSinger.name}</p>
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
          <Link to="start" onClick={props.resetSong}>
              <button className="button button-grey">Back</button>
          </Link>
          <button className="button button-blue" onClick={props.updateSong}>Update {props.updateCounter}</button>
          <button className="button button-green" onClick={props.getSongFromDatabase}>New song</button>
        </div>
      </div>
    )
  }

export default PlayerComponent;