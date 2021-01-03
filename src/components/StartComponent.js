import React from 'react';
import {Link} from 'react-router-dom';
import CurrentSingersComponent from './CurrentSingersComponent';

const StartComponent = (props) => {

    return (
        <div className="start">
            <h1>Karaoke Roulette</h1>
            <p>The random karaoke party machine</p>
            
            {props.queue.length > 0 && <CurrentSingersComponent queue={props.queue} />}
            <br />
            <input 
                id="sing-input"
                type="text" 
                value={props.value} 
                onChange={props.updateGenre} 
                placeholder="Type in genre or artist"
            />
            <br/>
            <Link to="add-singers">
                <button className="button button-yellow">Add singers</button>
            </Link>
            <Link to="player" onClick={props.fetchTracklist}>
                <button className="button button-green">Sing</button>
            </Link>
        </div>
    )
}

export default StartComponent;