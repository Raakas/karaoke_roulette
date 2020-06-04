import React from 'react';
import {Link} from 'react-router-dom';

const StartComponent = (props) => {
    return (
        <div className="start">
            <h1>Karaoke Roulette</h1>
            <p>Choose genre</p>
            <input type="text" value={props.value} onChange={props.handleChange}/>
            <br/>
            <Link to="player" onClick={props.fetchTracklist}><button className="button button-green">Sing</button></Link>
        </div>
    )
}

export default StartComponent;