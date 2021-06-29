import React from 'react';
import {Link} from 'react-router-dom';
import CurrentSingersComponent from './CurrentSingersComponent';
import DisplayTrackListComponent from './DisplayTrackListComponent';

const StartComponent = (props) => {

    return (
        <div className='start'>
            <div className="start__sidebar__left">
            </div>
            <div className="start__center">
                <h1>Karaoke Roulette</h1>
                <p>The random karaoke party machine</p>
                {props.queue.length > 0 && <CurrentSingersComponent queue={props.queue} />}
                <br />
                <div style={{display:"inline-table"}}>
                    <label htmlFor='artist-input'>Artist</label>
                    <input 
                        id='artist-input'
                        type='radio' 
                        name='artist-input'
                        value='artist' 
                        onChange={event => props.updateType(event)}
                        checked={props.type === 'artist'}
                    />
                    <label htmlFor='tag-input'>Genre</label>
                    <input 
                        id='tag-input'
                        type='radio' 
                        name='tag-input'
                        value='tag'
                        onChange={event => props.updateType(event)}
                        checked={props.type === 'tag'}
                    />
                    {props.apiError
                        ? <p>YouTube API unavailable :( Sing random songs from database.</p>
                        : <input 
                            id='song-input'
                            type='text' 
                            value={props.value} 
                            onChange={props.updateGenre} 
                            placeholder={`Type in ${props.type === 'tag' ? 'genre' : 'artist'}`}
                        />
                        }
                </div>
                <br/>
                <Link to='add-singers'>
                    <button className='button button-yellow'>Add singers</button>
                </Link>
                <button onClick={props.fetchTracklist} className='button button-orange'>Get tracklist</button>
                {props.trackList.length > 0
                    ? <Link to="player" onClick={props.getSong}>
                        <button className='button button-glory'>Sing</button>
                    </Link>
                    : <button className='button button-disabled'>Sing</button>
                }
            </div>
            <div className="start__sidebar__right">
                <DisplayTrackListComponent trackList={props.trackList} apiError={props.apiError}/>
            </div>
        </div>
    )
}

export default StartComponent;