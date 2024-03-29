import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { updateSearchType, updateTrackList } from '../store/App.slice'

import { ApiFetchService } from '../services/fetchService'

import SearchBar from './searchBarComponent'
import DisplayTrackListComponent from './DisplayTrackListComponent'
import CurrentSingersComponent from './CurrentSingersComponent'

const apiFetchService = new ApiFetchService()

const SongSearchComponent = ({ getSong }: any) => {

    const state = useSelector((state: RootState) => state.data)
    const { searchType, searchParam, youtubeApiError, title, source, trackList } = { ...state, ...state.message }

    const dispatch = useDispatch()

    const updateType = (event: any) => {
        let eventValue: string = event.currentTarget.value.toLowerCase()
        dispatch({
            type: updateSearchType, payload: eventValue,
        })
    }

    const getTracklistFromDatabase = async () => {
        let tracks = await apiFetchService.fetchTracklist(searchParam, youtubeApiError, title, source, searchType)
        dispatch({ type: updateTrackList, payload: tracks })
    }

    return (
        <div className='start'>
            <div className="start__sidebar__left">
            </div>
            <div className="start__center">
                <h1>Karaoke Roulette</h1>
                <p>The random karaoke party machine</p>
                <br />
                <CurrentSingersComponent />
                <div className="start-container">
                    {youtubeApiError
                        ? <p className='text-tiny'>YouTube API is down :( fetch tracklist from database</p>
                        : <>
                            <div className="start__center">
                                <label htmlFor='artist-input'>Artist</label>
                                <input
                                    id='artist-input'
                                    type='radio'
                                    name='artist-input'
                                    value='artist'
                                    onChange={e => updateType(e)}
                                    checked={searchType === 'artist'}
                                />
                                <label htmlFor='tag-input'>Genre</label>
                                <input
                                    id='tag-input'
                                    type='radio'
                                    name='tag-input'
                                    value='tag'
                                    onChange={e => updateType(e)}
                                    checked={searchType === 'tag'}
                                />
                            </div>
                            <div className="start__center">
                                <SearchBar />
                            </div>
                        </>
                    }
                </div>
                <br />
                <div className="buttons">
                    <Link to="add-singers">
                        <button className='button button-yellow'>Add singers</button>
                    </Link>
                    {searchParam || youtubeApiError === true
                        ? <button onClick={() => getTracklistFromDatabase()} className='button button-orange'>Get tracklist</button>
                        : <button className='button button-disabled'>Get tracklist</button>
                    }
                    {trackList.length > 0
                        ? <button className='button button-glory' onClick={() => getSong()}>Sing</button>
                        : <button className='button button-disabled'>Sing</button>
                    }
                </div>
            </div>
            <div className="start__sidebar__right">
                <DisplayTrackListComponent />
            </div>
        </div>
    )
}

export default SongSearchComponent