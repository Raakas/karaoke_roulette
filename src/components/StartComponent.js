import React from 'react';
import {Link} from 'react-router-dom';

const StartComponent = () => {
    return (
        <div className="main" id="mainWindow">
            <h1>Karaoke Roulette</h1>
            <Link to="host">Host a game</Link>
            <Link to="join">Join a game</Link>
            <Link to="player">Sing-alone</Link>
        </div>
    )
}

export default StartComponent;