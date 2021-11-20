import React from 'react';
import {Link} from 'react-router-dom';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const PlayerComponent = (props) => {
  
  const state = useSelector(initialState => initialState.data);
  const dispatch = useDispatch();

  const [player, setPlayer] = useState(false)

  if(player === false && window.YT){
    setTimeout(() => {
      // use timeout so the DOM iframe loads before events are added
      let pl = new window.YT.Player('player-frame', {
        playerVars: { 'autoplay': 1, 'controls': 0 },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        },
      });
    }, 1000);
  }

  function onPlayerReady() {
    setPlayer(true)
  }

  function onPlayerStateChange(event) {
    if(event !== undefined && event.data === 0){
      props.getNewSingerAndSong();
    }
  }

    return (
      <div className='player'>
        <p>{state.currentSinger.name}</p>
        <h2>{state.title}</h2>
        <iframe 
          id='player-frame'
          title='youtube'
          src={state.source + '?autoplay=1&controls=0&fs=1&enablejsapi=1&enablecastapi=1'}
          frameBorder='0'
          allow=''
          allowFullScreen>
        </iframe>
        <br/>
        <div className='buttons'>
          <Link to='start' onClick={props.resetSong}>
              <button className='button button-grey'>Back</button>
          </Link>
          {state.updateCounter > 1
            ? <a><button className='button button-blue' onClick={props.updateSong}>Update {state.updateCounter - 1}</button></a>
            : <a><button className='button button-disabled'>Update</button></a>
          }
          <a><button className='button button-orange' onClick={props.getSong}>New song</button></a>
        </div>
      </div>
    )
  }

export default PlayerComponent;