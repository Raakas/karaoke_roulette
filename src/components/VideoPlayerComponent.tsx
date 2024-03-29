import { useState, useEffect} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { updateSetMessage } from '../store/App.slice'

const VideoPlayerComponent = ({ getSong, resetAndReturnViewToSearch, updateYoutubeSource, saveSongToDatabase }: any) => {
  const state = useSelector((initialState: RootState) => initialState.data)
  const dispatch = useDispatch()
  const [seconds, setSeconds] = useState(0)
  const [useTimer, setUseTimer] = useState(true)
  const [ytPlayerState, setYtPlayerState] = useState(false)

  const urlParams: string = '?autoplay=1&controls=0&fs=1&enablejsapi=1&enablecastapi=1'

  if (ytPlayerState === false) {
    setTimeout(() => {
      // use timeout so the DOM iframe loads before events are added
      new window.YT.Player('player-frame', {
        playerVars: { 'autoplay': 1, 'controls': 0 },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError,
        },
      })
    }, 1000)
  }

  function onPlayerReady(){
    setYtPlayerState(true)
    setTimerChanges(0)
  }

  function onPlayerStateChange(event: any) {
    if(event === undefined) return
    /*
      event.data:
        0 video ends
        1 video plays
        2 video pauses
        3 video rewind
    */

    if (event.data === 0) {
      getNewSingerAndSong()
      saveSongToDatabase(state.title, state.source)
      setTimerChanges()
    } 
    else {
      setTimerChanges(event.data)
    }
  }

  const onPlayerError = () => {
    return getSong(false)
  }

  const getNewSingerAndSong = () => {
    let timer = 10 // seconds

    let popup_content = {
      title: `Nice job! `,
      message: '',
      isErrorMessage: false,
      timer,
    }

    if (state.singerQueue.length > 1) {
      popup_content.message += `Next singer: ${state.nextSinger}`
    }
    
    dispatch({type: updateSetMessage, payload: popup_content})

    setTimeout(() => {
      return getSong()
    }, timer * 1000)
  }

  const setTimerChanges = (video_player_event?: number) => {
    switch (video_player_event) {
      case 0:
        // start timer
        setSeconds(0)
        setUseTimer(true)
        break
      case 1:
        setUseTimer(true)
        break
      case 2:
        setUseTimer(false)
        break
      case 3:
        // do nothing
        break
      default:
        // stop timer / unexpected event
        setSeconds(0)
        setUseTimer(false)
        break
    }
  }

  useEffect(() => {
      let myInterval = setInterval(() => {
        if(useTimer) setSeconds(seconds + 1)
      }, 1000)
      return () => {
          clearInterval(myInterval)
      }
  }, [seconds, useTimer])

  if (seconds === state.videoPlayerSaveToDatabaseTimer){
    saveSongToDatabase(state.title, state.source)
    setTimerChanges()
  }

  return (
    <div className='player'>
      <p>{state.currentSinger}</p>
      <h2>{state.title}</h2>
      <iframe
        id='player-frame'
        title='youtube'
        src={state.source + urlParams}
        frameBorder='0'
        allow=''
        allowFullScreen>
      </iframe>
      <br />
      <div className='buttons'>
        <button className='button button-grey' onClick={() => resetAndReturnViewToSearch()}>Back</button>
        {state.YoutubeVideoCounter > 1
          ? <button className='button button-blue' onClick={() => updateYoutubeSource()}>Update {state.YoutubeVideoCounter - 1}</button>
          : <button className='button button-disabled' onClick={() => updateYoutubeSource()}>Update</button>
        }
        <button className='button button-orange' onClick={() => getSong()}>New song</button>
      </div>
    </div>
  )
}

export default VideoPlayerComponent