import React, { useState } from 'react';
import {Link} from 'react-router-dom';

const PlayerComponent = (props) => {

/*
  const [player, setPlayer] = useState(false)
  if(player === false && window.YT){
    let pl = new window.YT.Player('player-frame', {        
      events: {
        'onStateChange': onPlayerStateChange()
      },
    });
    if(pl.h){
      if(pl.h.id === 'player-frame'){
        console.log('set player')
        setPlayer(pl)
      }
    }
  }

  function onPlayerStateChange(event) {
    console.log('player event')
    console.log(event)
    console.log(player)
    if(event !== undefined){
      if(event.data === 0){
        //this.getSong()
      }
    }
  }
*/
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
            ? <a><button className='button button-blue' onClick={props.updateSong}>Update {props.updateCounter - 1}</button></a>
            : <a><button className='button button-disabled'>Update</button></a>
          }
          <a><button className='button button-orange' onClick={props.getSong}>New song</button></a>
        </div>
      </div>
    )
  }

export default PlayerComponent;