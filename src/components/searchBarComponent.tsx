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
      resetQuery()
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
      resetQuery()
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

  const resetQuery = () => {
    dispatch(updateSearchParam(''))
    setSearchMatches([])
  }

  useEffect(() => {
    resetQuery()
  }, [searchType])

  return (
    <>
      <input
        id="song-input"
        type="text"
        value={searchParam}
        onChange={(e) => getQueryParameter(e.target.value)}
        placeholder={`Type in ${searchType}`}
      />
      {searchParam ? (
        <a className="reset-button" onClick={() => resetQuery()}>
          X
        </a>
      ) : null}
      {searchMatches && (
        <div className="dropdown">
          <div className="results">
            {searchMatches.map((item: LastFmApiResponse) => (
              <p
                className="text-tiny"
                key={item.name}
                onClick={() => setSearchResult(item.name)}>
                {item.name}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default SearchBar
