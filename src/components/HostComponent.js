import React from 'react';
import {Link} from 'react-router-dom';


const HostComponent = (props) => {

    return (
        <div className="main" id="hostWindow">
        <h1>Host a new game</h1>
        <h3>Name of the game</h3>
        <form onSubmit={props.handleSubmit}>
            <input type="text" name="title" value={props.value} onChange={props.handleChange} />
            <h3>Genres</h3>
            <input type="checkbox" />Metal
            <input type="checkbox" />Rock
            <input type="checkbox" />Pop
            <h3>Add singers</h3>
            <input name="a" value={props.value} onChange={props.handleChange}/>
            <input name="b" value={props.value} onChange={props.handleChange}/>
            <input name="c" value={props.value} onChange={props.handleChange}/>
            <input name="d" value={props.value} onChange={props.handleChange}/>
            <input type="submit" value="Add players"/>
        </form>
        <Link to="/player">Go!</Link>
        <Link to="/start">Back</Link>
    </div>
    )
}

export default HostComponent;