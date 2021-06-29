import React from 'react';
import {Link} from 'react-router-dom';

const PlayerComponent = (props) => {

    return (
      <div className='player'>
        <p>{props.currentSinger.name}</p>
        <h2>{props.title}</h2>
        <iframe 
          title='youtube'
          id='player-frame'
          src={props.source + '?autoplay=1&controls=0&fs=1&enablejsapi=1&enablecastapi=1'}
          frameBorder='0'
          allow=''
          allowFullScreen>
        </iframe>
        <br/>
        <div className='buttons'>
          <Link to='start' onClick={props.resetSong}>
              <button className='button button-grey'>Back</button>
          </Link>
          {props.updateCounter > 1
            ? <button className='button button-blue' onClick={props.updateSong}>Update {props.updateCounter}</button>
            : <button className='button button-disabled'>Update {props.updateCounter}</button>
          }
          <button className='button button-orange' onClick={props.getSong}>New song</button>
        </div>
      </div>
    )
  }

export default PlayerComponent;