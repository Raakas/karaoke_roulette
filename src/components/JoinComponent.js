import React from 'react'
import {Link} from 'react-router-dom';

const JoinComponent = (props) => {
    return(
        <div className="main" id="joinWindow">
        <h1>Join a game</h1>
        <p>Enter the name of the game</p>
        <form onSubmit={props.handleSubmit}>
          <input value={props.value} onChange={props.handleChange} />
          <input type="submit" value="Add player" />
        </form>
        <Link to="/player">Go!</Link>
        <Link to="/start">Back</Link>
      </div>
    )
}

export default JoinComponent;