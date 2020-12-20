import React from 'react';
import {Link} from 'react-router-dom';

const StartComponent = (props) => {

    return (
        <div className="start">
            <h1>Karaoke Roulette</h1>
            <p>The karaoke party machine</p>
            <br/>
            <input 
                id="sing-input"
                type="text" 
                value={props.value} 
                onChange={props.handleChange} 
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