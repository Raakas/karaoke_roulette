import React from 'react';
import {Link} from 'react-router-dom';

const AddSingersComponent = (props) => {
    let all_singers = []
    let singer_length = 3
    let i = 0

    while(i < singer_length){
        if(props.queue !== undefined){
            if(props.queue[i] !== undefined){
                all_singers.push({id: props.queue[i].id, name: props.queue[i].name})
            }
            else {
                all_singers.push({id:i, name:'Singer ' + (i + 1)})
            }
        }
        else {
            all_singers.push({id:i, name:'Singer ' + (i + 1)})
        }
        i++
    }

    return (
        <div className="start">
            <h1>Karaoke Roulette</h1>
            <p>Add singers: </p>
            <br/>
            {all_singers.map((item, index)=>(
                <div key={index}>
                    <input 
                        id={index}
                        type="text" 
                        value={props.value}
                        onBlur={props.addSinger}
                        placeholder={item ? item.name: `Singer ${index}`}
                    />
                    <br/>
                </div>
            ))}
            <br/>
            <Link to="start">
                <button className="button button-grey">Back</button>
            </Link>
            <button className="button button-blue" onClick={props.resetSingers}>Reset</button>
            <Link to="start" onClick={props.saveSingers}>
                <button className="button button-orange">Save</button>
            </Link>
        </div>
    )
}

export default AddSingersComponent;