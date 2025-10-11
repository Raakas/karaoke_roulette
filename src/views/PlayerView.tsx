import React from 'react'
import VideoPlayerComponent from '../components/VideoPlayerComponent'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ApiFetchService } from '../services/fetchService'
import {
  updateYoutubeVideoCounter,
  setYoutubeUlrs,
  updateCurrentSong,
  resetSongAndTracklist,
  FirestoreError,
  increaseErrorCount,
  selectData,
  AppPaths,
} from '../store/appSlice'

const apiFetchService = new ApiFetchService()

interface PlayerViewProperties {
  getSong: () => void
}

export const PlayerView = ({ getSong }: PlayerViewProperties) => {
  const navigate = useNavigate()

  const dispatch = useDispatch()

  const state = useSelector(selectData)

  const {
    searchParam,
    currentSong,
    searchType,
    youtubeSourceUrls,
    YoutubeVideoCounter,
    currentSinger,
  } = state
  const { name } = currentSong

  const saveSongToDatabase = async (songTitle: string, sourceUrl: string) => {
    let response: FirestoreError = await apiFetchService.saveToDatabase(
      songTitle,
      sourceUrl,
      searchType,
      searchParam,
    )

    if (response.error) {
      console.error(response.error)
      dispatch(increaseErrorCount())
    }
  }

  const updateYoutubeSource = () => {
    let sources = [...youtubeSourceUrls]

    const source = sources.shift()
    const updateCounter = youtubeSourceUrls.length

    if (!!source) {
      dispatch(
        updateCurrentSong({
          name,
          source,
        }),
      )
      dispatch(updateYoutubeVideoCounter(updateCounter))
      dispatch(setYoutubeUlrs(sources))

      saveSongToDatabase(name, source)
    }
  }

  const resetSongAndTracklistAndReturn = async () => {
    dispatch(resetSongAndTracklist())
    navigate(AppPaths.HOME)
  }

  return (
    <div className="player">
      <p>{currentSinger?.name}</p>
      <h2>{name}</h2>
      <VideoPlayerComponent
        getSong={getSong}
        saveSongToDatabase={saveSongToDatabase}
      />
      <div className="buttons">
        <button
          className="button button-grey"
          onClick={() => resetSongAndTracklistAndReturn()}>
          Back
        </button>
        {YoutubeVideoCounter > 1 ? (
          <button
            className="button button-blue"
            onClick={() => updateYoutubeSource()}>
            Update {YoutubeVideoCounter - 1}
          </button>
        ) : (
          <button
            className="button button-disabled"
            onClick={() => updateYoutubeSource()}>
            Update
          </button>
        )}
        <button className="button button-orange" onClick={() => getSong()}>
          New song
        </button>
      </div>
    </div>
  )
}
