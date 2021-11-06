import React from 'react';
import {Link} from 'react-router-dom';
import CurrentSingersComponent from './CurrentSingersComponent';
import DisplayTrackListComponent from './DisplayTrackListComponent';
import SearchBar from './searchBarComponent';

const StartComponent = (props) => {
    return (
        <div className='start'>
            <div className="start__sidebar__left">
            </div>
            <div className="start__center">
                <h1>Karaoke Roulette</h1>
                <p>The random karaoke party machine</p>
                {props.singerQueue.length > 0 && <CurrentSingersComponent singerQueue={props.singerQueue} />}
                <br />
                <div className="start-container">
                    {props.youtubeApiError
                        ? <p>YouTube API unavailable :( Sing random songs from database.</p>
                        : <>
                            <div className="start__center">
                                <label htmlFor='artist-input'>Artist</label>
                                <input 
                                    id='artist-input'
                                    type='radio' 
                                    name='artist-input'
                                    value='artist' 
                                    onChange={event => props.updateSearchType(event)}
                                    checked={props.searchType === 'artist'}
                                />
                                <label htmlFor='tag-input'>Genre</label>
                                <input 
                                    id='tag-input'
                                    type='radio' 
                                    name='tag-input'
                                    value='tag'
                                    onChange={event => props.updateSearchType(event)}
                                    checked={props.searchType === 'tag'}
                                />
                            </div>
                            <div className="start__center">
                                <SearchBar 
                                    value={props.value}
                                    type={props.searchType}
                                    updateSearchParam={props.updateSearchParam}
                                    fetchTracklist={props.fetchTracklist}
                                />
                            </div>
                        </>
                        }
                </div>
                <br/>
                <div className="buttons">
                    <Link to='add-singers'>
                        <button className='button button-yellow'>Add singers</button>
                    </Link>
                    {props.searchParam
                        ? <a><button onClick={() => props.fetchTracklist()} className='button button-orange'>Get tracklist</button></a>
                        : <a><button className='button button-disabled'>Get tracklist</button></a>
                    }
                    {props.trackList.length > 0
                        ? <Link to="player" onClick={props.getSong}>
                            <button className='button button-glory'>Sing</button>
                        </Link>
                        : <a><button className='button button-disabled'>Sing</button></a>
                    }
                </div>
            </div>
            <div className="start__sidebar__right">
                <DisplayTrackListComponent trackList={props.trackList} youtubeApiError={props.youtubeApiError} removeTrack={props.removeTrack}/>
            </div>
        </div>
    )
}

export default StartComponent;