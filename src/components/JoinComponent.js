import React from 'react'

const JoinComponent = (props) => {
    return(
        <div className="main" id="joinWindow">
            <h1>Join a game</h1>
            <p>Enter the name of the game</p>
            <input type="text" />
            <button id="start-button" onClick={props.startGame}>Start singing!</button>
        </div>
    )
}

export default JoinComponent;