import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { LastFmApiResponse, updateSearchParam, updateTrackList } from '../store/App.slice'
import { ApiFetchService } from '../services/fetchService'
import { RootState } from '../store/store'

const apiFetchService = new ApiFetchService()

const SearchBar = () => {

    const state = useSelector((initialState: RootState) => initialState.data)
    const dispatch = useDispatch()
    const [searchMatches, setSearchMatches] = useState<Array<LastFmApiResponse>>()

    const isEmpty = (param: string): boolean => !param || param.length === 0

    const updateSearchParameter = (event: any) => {
        if (isEmpty(event)) {
            return
        }

        let searchParam: string = event.target ? event.target.value.toLowerCase().trim() : event
        dispatch({ type: updateSearchParam, payload: searchParam })

        if (isEmpty(searchParam)) {
            dispatch({
                type: updateTrackList, payload: []
            })
        }
    }

    const fetchSearcResultsFromAPI = async (value: string) => {

        if (isEmpty(value)) {
            resetQuery()
        }
        else {

            await apiFetchService.searchBarAPI(value, state.searchType).then((result: any): Array<LastFmApiResponse> => {
                setSearchMatches(result)
                return result
            })
        }
    }

    const setSearchResult = async (result: string) => {
        setSearchMatches([])
        updateSearchParameter(result)
        const newTrackList = await apiFetchService.lastFmTrackFetcher(state.searchParam, state.searchType)
        dispatch({ type: updateTrackList, payload: newTrackList })
    }

    const getQueryParameter = (value: string) => {
        if (isEmpty(value)) {
            resetQuery()
        }
        else if (value.length > 6) {
            let results
            if (searchMatches && searchMatches.length > 0){ 
                results = searchMatches?.filter((a: LastFmApiResponse) => a.name.toLowerCase().includes(value.toLowerCase()))
            }
            setSearchMatches(results)
        }
        else {
            fetchSearcResultsFromAPI(value)
        }
        updateSearchParameter(value)
    }

    const resetQuery = () => {
        setSearchMatches([])
    }

    useEffect(() => {
        resetQuery()
    }, [state.searchType])

    return (
        <>
            <input
                id='song-input'
                type='text'
                value={state.searchParam}
                onChange={(e) => getQueryParameter(e.target.value)}
                placeholder={`Type in ${state.searchType === 'tag' ? 'genre' : 'artist'}`}
            />
            {state.searchParam
                ? <a className="reset-button" onClick={() => resetQuery()}>X</a>
                : null
            }
            {searchMatches &&
                <div className="dropdown">
                    <div className="results">
                        {searchMatches.map((item: LastFmApiResponse) => (
                            <p
                                className="text-tiny"
                                key={item.name} onClick={() => setSearchResult(item.name)}
                            >
                                {item.name}
                            </p>
                        ))}
                    </div>
                </div>
            }
        </>
    )
}

export default SearchBar