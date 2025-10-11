import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  updateSetMessage,
  selectTitle,
  selectSource,
  selectSingerQueue,
  selectNextSinger,
  selectTimebeforeNextSong,
  selectVideoPlayerSaveToDatabaseTimer,
} from '../store/appSlice'
import { useSelector } from 'react-redux'

enum YoutubeEventType {
  END = 0,
  PLAY = 1,
  PAUSE = 2,
  REWIND = 3,
}

const VideoPlayerComponent = ({ getSong, saveSongToDatabase }: any) => {
  const dispatch = useDispatch()

  const title = useSelector(selectTitle)
  const source = useSelector(selectSource)
  const singerQueue = useSelector(selectSingerQueue)
  const nextSinger = useSelector(selectNextSinger)
  const videoPlayerSaveToDatabaseTimer = useSelector(
    selectVideoPlayerSaveToDatabaseTimer,
  )
  const timebeforeNextSong = useSelector(selectTimebeforeNextSong)

  const [seconds, setSeconds] = useState(0)
  const [useTimer, setUseTimer] = useState(true)
  const [ytPlayerState, setYtPlayerState] = useState(false)

  const urlParams: string =
    '?autoplay=1&controls=0&fs=1&enablejsapi=1&enablecastapi=1'

  if (ytPlayerState === false) {
    setTimeout(() => {
      // use timeout so the DOM iframe loads before events are added
      new window.YT.Player('player-frame', {
        playerVars: { autoplay: 1, controls: 0 },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      })
    }, 1000)
  }

  function onPlayerReady() {
    setYtPlayerState(true)
    setTimerChanges(0)
  }

  function onPlayerStateChange(event: any) {
    if (!event) return
    /*
      event.data:
        0 video ends
        1 video plays
        2 video pauses
        3 video rewind
    */

    const { data } = event

    if (data === YoutubeEventType.END) {
      getNewSingerAndSong()
      saveSongToDatabase(title, source)
    }

    setTimerChanges(data)
  }

  const onPlayerError = () => {
    return getSong(false)
  }

  const getNewSingerAndSong = () => {
    let popup_content = {
      title: `Nice job! `,
      message: 'Get ready for new song! ',
      isErrorMessage: false,
      timer: timebeforeNextSong,
    }

    if (singerQueue.length > 1) {
      popup_content.message += `Next singer: ${nextSinger?.name}`
    }

    dispatch(updateSetMessage(popup_content))

    setTimeout(() => {
      return getSong()
    }, timebeforeNextSong * 1000)
  }

  const setTimerChanges = (video_player_event?: YoutubeEventType) => {
    switch (video_player_event) {
      case YoutubeEventType.END:
        // start timer
        setSeconds(0)
        setUseTimer(true)
        break
      case YoutubeEventType.PLAY:
        setUseTimer(true)
        break
      case YoutubeEventType.PAUSE:
        setUseTimer(false)
        break
      case YoutubeEventType.REWIND:
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
      if (useTimer) setSeconds(seconds + 1)
    }, 1000)
    return () => {
      clearInterval(myInterval)
    }
  }, [seconds, useTimer])

  if (seconds === videoPlayerSaveToDatabaseTimer) {
    saveSongToDatabase(title, source)
    setTimerChanges()
  }

  return (
    <iframe
      id="player-frame"
      title="youtube"
      src={source + urlParams}
      frameBorder="0"
      allow=""
      allowFullScreen
    />
  )
}

export default VideoPlayerComponent
