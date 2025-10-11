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

  const fetchNewTracklist = async (youtubeDown?: boolean) => {
    const tracks = await apiFetchService.fetchTracklist(
      searchParam,
      youtubeDown !== undefined ? youtubeDown : youtubeApiError,
      currentSong,
      searchType,
    )
    dispatch(updateTrackList(tracks))
  }

  const GetSong = async () => {
    /*
      Find a random song from generated track list.

      - Track list is fetched using LastFM API.
      - Track list may not include source for song so source is fetched using YouTube API first.
      - If YouTube does not work, or have the url, try to find song from Firebase database.
      - If all fails, track list is generated from database where all songs has title and source.

      Karaoke never ends!
    */

    let sourceUrl: string = ''
    let songTitle: string = ''

    if (youtubeApiError === false) {
      if (
        !searchParam.length ||
        searchParam === null ||
        searchParam === undefined
      ) {
        setMessageModal('Empty input, try again', true)
        return
      }
    }

    if (trackList.length <= 1) {
      // list is running out. Give empty search parameter so search will use title and source for similar songs.
      await apiFetchService
        .fetchTracklist('', youtubeApiError, currentSong, searchType)
        .then((songs: Array<Song>) => {
          dispatch(updateTrackList(songs))

          let index = Math.floor(Math.random() * songs.length)
          songTitle = songs[index].name
        })
        .catch((error: Error) => console.error('error:', error))
    } else {
      const track = getSongFromTracklist()
      songTitle = track.name
      sourceUrl = track.source
    }

    if (!sourceUrl && !youtubeApiError) {
      // try to get source from YouTube API

      if (errorCounter >= errorLimit) {
        // prevent calling YouTube API too much per song if not found.
        return setMessageModal(songTitle + ' not found, try something else')
      }

      let YoutubeResponse = await apiFetchService.getSongFromYoutube(songTitle)

      if (YoutubeResponse.error) {
        // YouTube API quota used for the day most probably.
        console.error(YoutubeResponse.error)
        setMessageModal(YoutubeResponse.message, true)
        dispatch(setYoutubeApiError(true))
        dispatch(updateSearchParam(''))
        fetchNewTracklist(true)
        return
      }

      dispatch(updateYoutubeVideoCounter(YoutubeResponse.counter))
      dispatch(setYoutubeUlrs(YoutubeResponse.urls))

      sourceUrl = YoutubeResponse.source
    }

    if (!sourceUrl && youtubeApiError && trackList.length <= 0) {
      // try get song source from old database
      dispatch(updateYoutubeVideoCounter(0))
      sourceUrl = await apiFetchService.getSongFromOldDatabase(
        songTitle,
        searchParam,
      )
    }

    if (!sourceUrl) {
      // song could not be found.
      dispatch(updateTrackList(trackList.filter((x) => x.name !== songTitle)))
      setMessageModal(songTitle + ' not found', true)
      return
    }

    dispatch(getNewSinger())

    dispatch(
      updateCurrentSong({
        name: songTitle,
        source: sourceUrl.split('?')[0],
      }),
    )

    dispatch(resetErrorCounter())
    setMessageModal('', false)
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
          <Route
            path="/"
            element={
              <SearchView getSong={GetSong} getTrackList={fetchNewTracklist} />
            }
          />
          <Route path="/player" element={<PlayerView getSong={GetSong} />} />
          <Route path="/add-singers" element={<SingersView />} />
        </Routes>
        <MessageComponent />
      </div>
    </BrowserRouter>
  )
}

export default App
