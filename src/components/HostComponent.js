import React from 'react';
import {Link} from 'react-router-dom';


const HostComponent = (props) => {

    return (
        <div className="main" id="hostWindow">
            <h1>Host a new game</h1>
            <h3>Name of the game</h3>
            <form onSubmit={props.handelSubmit}>
                <input type="text" />
                <h3>Genres</h3>
                <input type="checkbox" />Metal
                <input type="checkbox" />Rock
                <input type="checkbox" />Pop
                <h3>Add singers</h3>
                <input value={props.input} onChange={props.handleChange}/>
                <input type="submit" value="Go!"/>
            </form>
            <Link to="/start">Back</Link>
        </div>
    )
}

export default HostComponent;