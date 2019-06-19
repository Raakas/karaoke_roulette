import React from 'react'

const HostComponent = (props) => {
    return (
        <div className="main" id="hostWindow">
            <h1>Host a new game</h1>
            <h3>Name of the game</h3>
            <input type="text" />
            <h3>Genres</h3>
            <button>Metal</button>
            <button>Rock</button>
            <button>Pop</button>
            <h3>Add singers</h3>
            <input type="text" />
            <button>Add singer</button>
            <button id="start-button" onClick={props.startGame}>Start singing!</button>
        </div>
    )
}

export default HostComponent;