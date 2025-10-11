import MessageComponent from './components/MessageComponent'
import { Routes, Route, BrowserRouter } from 'react-router-dom'

import './app.scss'
import { PlayerView } from './views/PlayerView'
import { SearchView } from './views/SearchView'
import { SingersView } from './views/SingersView'

import { useDispatch, useSelector } from 'react-redux'
import { ApiFetchService } from './services/fetchService'
import {
  Song,
  updateYoutubeVideoCounter,
  setYoutubeUlrs,
  updateSetMessage,
  updateCurrentSong,
  updateTrackList,
  setYoutubeApiError,
  updateSearchParam,
  resetErrorCounter,
  getNewSinger,
  selectData,
} from './store/appSlice'

const apiFetchService = new ApiFetchService()

const App = () => {
  var tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'

  var firstScriptTag = document.getElementsByTagName('script')[0]
  if (firstScriptTag !== null && firstScriptTag.parentNode !== null) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
  }

  const dispatch = useDispatch()

  const state = useSelector(selectData)

  const {
    searchParam,
    youtubeApiError,
    trackList,
    currentSong,
    searchType,
    errorCounter,
    errorLimit,
  } = state
  const { name, source } = currentSong

  const GetSong = async (get_new_singer = true) => {
    const setMessageModal = (title?: string, error?: any) => {
      dispatch(
        updateSetMessage({
          title: title || '',
          message: '',
          isErrorMessage: error,
          timer: 0,
        }),
      )
    }

    let sourceUrl: string = ''
    let songTitle: string = ''
    let index: number = 0

    if (youtubeApiError === false) {
      if (
        !searchParam.length ||
        searchParam === null ||
        searchParam === undefined
      ) {
        setMessageModal('Empty input, try again', true)
      }
    }

    if (trackList.length <= 1) {
      // list is running out. Give empty search parameter so search will use title and source for similar songs.
      await apiFetchService
        .fetchTracklist('', youtubeApiError, name, source, searchType)
        .then((songs: Array<Song>) => {
          dispatch(updateTrackList(songs))

          index = Math.floor(Math.random() * songs.length)
          songTitle = songs[index].name
        })
        .catch((error: Error) => console.error('error:', error))
    } else {
      index = Math.floor(Math.random() * trackList.length)
      songTitle = trackList[index].name
    }

    setMessageModal('', false)

    if (youtubeApiError && trackList.length > 0) {
      const track = getSongFromTracklist()
      songTitle = track.name
      sourceUrl = track.source
    } else {
      dispatch(updateYoutubeVideoCounter(0))
      sourceUrl = await apiFetchService.getSongFromOldDatabase(
        songTitle,
        searchParam,
      )
    }

    if (!!sourceUrl === false && youtubeApiError === false) {
      if (errorCounter >= errorLimit) {
        return setMessageModal(songTitle + ' not found, try something else')
      }
      let YoutubeResponse = await apiFetchService.getSongFromYoutube(songTitle)

      if (YoutubeResponse.error) {
        console.error(YoutubeResponse.error)
        setMessageModal(YoutubeResponse.message, true)
        dispatch(setYoutubeApiError(true))
        dispatch(updateTrackList([]))
        dispatch(updateSearchParam(''))
        return
      }

      dispatch(updateYoutubeVideoCounter(YoutubeResponse.counter))
      dispatch(setYoutubeUlrs(YoutubeResponse.urls))

      sourceUrl = YoutubeResponse.source
    }

    if (sourceUrl === '') {
      let tracks = trackList
      tracks = tracks.filter((x) => x.name !== songTitle)
      dispatch(updateTrackList(tracks))
      setMessageModal(songTitle + ' not found', true)
      return
    }

    if (get_new_singer) {
      dispatch(getNewSinger())
    }
    dispatch(
      updateCurrentSong({
        name: songTitle,
        source: sourceUrl.split('?')[0],
      }),
    )

    dispatch(resetErrorCounter())
  }

  const getSongFromTracklist = () => {
    let track = trackList[Math.floor(Math.random() * trackList.length)]
    dispatch(updateCurrentSong({ ...track }))
    return track
  }

  return (
    <BrowserRouter>
      <div className="main">
        <Routes>
          <Route path="/" element={<SearchView getSong={GetSong} />} />
          <Route path="/player" element={<PlayerView getSong={GetSong} />} />
          <Route path="/add-singers" element={<SingersView />} />
        </Routes>
        <MessageComponent />
      </div>
    </BrowserRouter>
  )
}

export default App
