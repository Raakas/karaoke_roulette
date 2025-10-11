import React, { useEffect } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { SearchChoices, selectData, updateSearchType } from '../store/appSlice'

import CurrentSingersComponent from '../components/CurrentSingersComponent'
import SearchBar from '../components/searchBarComponent'
import DisplayTrackListComponent from '../components/DisplayTrackListComponent'

interface SearchViewProperties {
  getSong: () => void
  getTrackList: () => void
}

export const SearchView = ({ getSong, getTrackList }: SearchViewProperties) => {
  const navigate = useNavigate()

  const state = useSelector(selectData)

  const { searchType, searchParam, youtubeApiError, currentSong, trackList } =
    state

  const dispatch = useDispatch()

  const updateType = (value: SearchChoices) => {
    dispatch(updateSearchType(value))
  }

  useEffect(() => {
    if (currentSong.name && currentSong.source) {
      navigate('player')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong])

  return (
    <div className="start">
      <div className="start__sidebar"></div>
      <div className="start__center">
        <h1>Karaoke Roulette</h1>
        <p>The random karaoke party machine</p>
        <CurrentSingersComponent />
        <div className="start-container">
          {youtubeApiError ? (
            <div className="error-message">
              <p className="text-micro">YouTube API is down :(</p>
              <p className="text-micro">
                Tracklist is from the database. Search cannot be used currently.
              </p>
            </div>
          ) : (
            <>
              <div className="start__center">
                <label htmlFor="artist-input">Artist</label>
                <input
                  id="artist-input"
                  type="radio"
                  name="artist-input"
                  value={SearchChoices.ARTIST}
                  onChange={(e) => updateType(e.target.value as SearchChoices)}
                  checked={searchType === 'artist'}
                />
                <label htmlFor="tag-input">Genre</label>
                <input
                  id="tag-input"
                  type="radio"
                  name="tag-input"
                  value={SearchChoices.GENRE}
                  onChange={(e) => updateType(e.target.value as SearchChoices)}
                  checked={searchType === 'tag'}
                />
              </div>
              <div className="start__center">
                <SearchBar />
              </div>
            </>
          )}
        </div>
        <div className="buttons">
          <Link to="add-singers">
            <button className="button button-yellow">Add singers</button>
          </Link>
          {searchParam || youtubeApiError === true ? (
            <button
              onClick={() => getTrackList()}
              className="button button-orange">
              Get tracklist
            </button>
          ) : (
            <button className="button button-disabled">Get tracklist</button>
          )}
          {trackList.length > 0 ? (
            <button className="button button-glory" onClick={() => getSong()}>
              Sing
            </button>
          ) : (
            <button className="button button-disabled">Sing</button>
          )}
        </div>
      </div>
      <div className="start__sidebar">
        <DisplayTrackListComponent />
      </div>
    </div>
  )
}

export default SearchView
