import React, { useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSearchType } from '../store/App.slice'
import SearchBar from './searchBarComponent';

const StartComponent = (props) => {

    const state = useSelector(initialState => initialState.data);
    const dispatch = useDispatch();

    const [searchType, setUpdateSearchType ] = useState('tag');

    const updateType = (event) => {
        let string = event.target.value.toLowerCase();
        setUpdateSearchType(string)
        dispatch({
            type: updateSearchType, payload: string, 
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
                        <SearchBar 
                            type={searchType}
                            fetchTracklist={props.fetchTracklist}
                        />
                    </div>
                </div>
                <br/>
                <div className="buttons">
                {state.searchParam
                    ? <a><button onClick={() => props.fetchTracklist()} className='button button-orange'>Get tracklist</button></a>
                    : <a><button className='button button-disabled'>Get tracklist</button></a>
                }                
                </div>
            </div>
        </div>
    )
}

export default StartComponent;