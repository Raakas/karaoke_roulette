import React, { isValidElement } from 'react';
import {Link} from 'react-router-dom';
import { useState } from 'react';

const PlayerComponent = (props) => {

  const [player, setPlayer] = useState(false)

  if(player === false && window.YT){
    setTimeout(() => {
      // use timeout so the DOM iframe loads before events are added
      let pl = new window.YT.Player('player-frame', {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        },
      });
      if(pl.h){
        if(pl.h.id === 'player-frame'){
          setPlayer(true)
        }
      }
    }, 1000);
  }


  function onPlayerStateChange(event) {
    if(event !== undefined && event.data === 0){
      return props.getNewSingerAndSong();
    }
  }

    return (
      <div className='player'>
        <p>{props.currentSinger.name}</p>
        <h2>{props.title}</h2>
        <iframe 
          id='player-frame'
          title='youtube'
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
            ? <a><button className='button button-blue' onClick={props.updateSong}>Update {props.updateCounter - 1}</button></a>
            : <a><button className='button button-disabled'>Update</button></a>
          }
          <a><button className='button button-orange' onClick={props.getSong}>New song</button></a>
        </div>
      </div>
    )
  }

export default PlayerComponent;