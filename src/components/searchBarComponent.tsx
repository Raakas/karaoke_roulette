import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  LastFmApiResponse,
  updateSearchParam,
  updateTrackList,
  selectSearchType,
  selectSearchParam,
} from '../store/appSlice'
import { ApiFetchService } from '../services/fetchService'

const apiFetchService = new ApiFetchService()

const SearchBar = () => {
  const dispatch = useDispatch()

  const searchType = useSelector(selectSearchType)
  const searchParam = useSelector(selectSearchParam)

  const [searchMatches, setSearchMatches] = useState<Array<LastFmApiResponse>>()

  const isEmpty = (param: string): boolean => !param || param.length === 0

  const updateSearchParameter = (event: any) => {
    if (isEmpty(event)) {
      dispatch(updateSearchParam(''))
      return
    }

    let searchParam: string = event.target
      ? event.target.value.toLowerCase().trim()
      : event
    dispatch(updateSearchParam(searchParam))

    if (isEmpty(searchParam)) {
      dispatch(updateTrackList([]))
    }
  }

  const fetchSearcResultsFromAPI = async (value: string) => {
    if (isEmpty(value)) {
      resetSearch()
    } else {
      await apiFetchService
        .searchBarAPI(value, searchType)
        .then((result: any): Array<LastFmApiResponse> => {
          setSearchMatches(result)
          return result
        })
    }
  }

  const setSearchResult = async (result: string) => {
    setSearchMatches([])
    updateSearchParameter(result)
    const newTrackList = await apiFetchService.lastFmTrackFetcher(
      searchParam,
      searchType,
    )
    dispatch(updateTrackList(newTrackList))
  }

  const getQueryParameter = (value: string) => {
    if (isEmpty(value)) {
      resetSearch()
    } else if (value.length > 6) {
      let results
      if (searchMatches && searchMatches.length > 0) {
        results = searchMatches?.filter((a: LastFmApiResponse) =>
          a.name.toLowerCase().includes(value.toLowerCase()),
        )
      }
      setSearchMatches(results)
    } else {
      fetchSearcResultsFromAPI(value)
    }
    updateSearchParameter(value)
  }

  const resetSearch = () => {
    dispatch(updateSearchParam(''))
    setSearchMatches([])
  }

  return (
    <div className="search-bar">
      <div className="search-controls">
        <input
          className="song-input"
          type="text"
          value={searchParam}
          onChange={(e) => getQueryParameter(e.target.value)}
          placeholder={`Type in ${searchType}`}
        />
        {searchParam && (
          <a className="reset-button" onClick={() => resetSearch()}>
            X
          </a>
        )}
      </div>
      {searchMatches && searchMatches.length > 0 && (
        <div className="results">
          {searchMatches?.map((item: LastFmApiResponse) => (
            <p
              key={item.name}
              className="text-tiny"
              onClick={() => setSearchResult(item.name)}>
              {item.name}
            </p>
          ))}
        </div>
      )}
      {searchParam && searchMatches && (
        <p>Nothing found, but try to get track list !</p>
      )}
    </div>
  )
}

export default SearchBar
