import React from 'react';
import {Link} from 'react-router-dom';

const PlayerComponent = (props) => {
  let singer = ''

  if (props.queue !== undefined){
    let random = Math.floor(Math.random() * props.queue.length)
    singer = props.queue[random].name
  }

    return (
      <div className="player">
        <p>{singer}</p>
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
          <Link to="start">
              <button className="button button-grey">Back</button>
          </Link>
          <button className="button button-blue" onClick={props.updateSong}>Update {props.updateCounter}</button>
          <button className="button button-green" onClick={props.getSongFromDatabase}>New song</button>
        </div>
      </div>
    )
  }

export default PlayerComponent;