import React from 'react'
import {Link} from 'react-router-dom';

const JoinComponent = (props) => {
    return(
        <div className="main" id="joinWindow">
            <h1>Join a game</h1>
            <p>Enter the name of the game</p>
            <input type="text" />
            <Link to="/player">Join game!</Link>
            <Link to="/start">Back</Link>
        </div>
    )
}

export default JoinComponent;