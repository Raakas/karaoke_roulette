import React from 'react';
import {Link} from 'react-router-dom';
import CurrentSingersComponent from './CurrentSingersComponent';

const StartComponent = (props) => {

    return (
        <div className='start'>
            <h1>Karaoke Roulette</h1>
            <p>The random karaoke party machine</p>
            {props.modalVisible
                ? <>
                    <p>Too many errors. Fetch tracklist from database.</p>
                    <Link onClick={props.fetchTracklist}>
                        <button className='button button-green'>Tracklist from database</button>
                    </Link>
                </>
                : <>
                    {props.queue.length > 0 && <CurrentSingersComponent queue={props.queue} />}
                    <br />
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
                    <input 
                        id='song-input'
                        type='text' 
                        value={props.value} 
                        onChange={props.updateGenre} 
                        placeholder={`Type in ${props.type === 'tag' ? 'genre' : 'artist'}`}
                    />
                    <br/>
                    <Link to='add-singers'>
                        <button className='button button-yellow'>Add singers</button>
                    </Link>
                    <Link to='player' onClick={props.fetchTracklist}>
                        <button className='button button-green'>Sing</button>
                    </Link>
                </>
            }
        </div>
    )
}

export default StartComponent;