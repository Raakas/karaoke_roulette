import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import CurrentSingersComponent from './CurrentSingersComponent';
import DisplayTrackListComponent from './DisplayTrackListComponent';
import SearchBar from './searchBarComponent';
import { useSelector, useDispatch } from 'react-redux';
import { current } from '@reduxjs/toolkit';

const StartComponentOld = (props) => {

    const state = useSelector(initialState => initialState);
    const [singerQueue, setSingerQueue ] = [];
    const searchParam = state.searchParam;
    const dispatch = useDispatch();

    const getInitialValues = () => setSingerQueue([...singerQueue, {name: "pelaaja1"}])

    useEffect(() => {
        getInitialValues();
    }, [state])

    const updateSearchType = (event) => {
        console.log('update search tpe')
        let string = event.target.value.toLowerCase()
        console.log(string)

        dispatch({
            searchType: string
        })
    }

    return (
        <div className='start'>
            <div className="start__sidebar__left">
            </div>
            <div className="start__center">
                <h1>Karaoke Roulette</h1>
                <p>The random karaoke party machine</p>
                <br />
                <div className="start-container">
                    {state.youtubeApiError
                        ? <p>YouTube API unavailable :( Sing random songs from database.</p>
                        : <>
                            <div className="start__center">
                                <label htmlFor='artist-input'>Artist</label>
                                <input 
                                    id='artist-input'
                                    type='radio' 
                                    name='artist-input'
                                    value='artist' 
                                    onChange={event => updateSearchType(event)}
                                    checked={state.searchType === 'artist'}
                                />
                                <label htmlFor='tag-input'>Genre</label>
                                <input 
                                    id='tag-input'
                                    type='radio' 
                                    name='tag-input'
                                    value='tag'
                                    onChange={event => updateSearchType(event)}
                                    checked={state.searchType === 'tag'}
                                />
                            </div>
                            <div className="start__center">
                                <SearchBar 
                                    value={props.value}
                                    type={state.searchType}
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
                    {searchParam
                        ? <a><button onClick={() => props.fetchTracklist()} className='button button-orange'>Get tracklist</button></a>
                        : <a><button className='button button-disabled'>Get tracklist</button></a>
                    }
                    {state != undefined && state.trackList.length > 0
                        ? <Link to="player" onClick={props.getSong}>
                            <button className='button button-glory'>Sing</button>
                        </Link>
                        : <a><button className='button button-disabled'>Sing</button></a>
                    }
                </div>
            </div>
            <div className="start__sidebar__right">
                <DisplayTrackListComponent trackList={state.trackList} youtubeApiError={state.youtubeApiError} removeTrack={props.removeTrack}/>
            </div>
        </div>
    )
}

export default StartComponentOld;