import React from 'react';
import {Link} from 'react-router-dom';

const AddSingersComponent = (props) => {
    let all_singers = []
    let singer_amount = 3
    let i = 0

    while(i < singer_amount){
        if(props.queue !== undefined && props.queue[i] !== undefined){
            all_singers.push({id: props.queue[i].id, name: props.queue[i].name})
        }
        else {
            let random = Math.floor(Math.random() * 1000)
            all_singers.push({id:random, name:'Singer ' + (i + 1)})
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
                        id={item ? item.id : index}
                        type="text" 
                        value={props.value}
                        onBlur={props.addSinger}
                        placeholder={item ? item.name: `Singer ${index}`}
                    />
                    <i id={item ? item.id : index} className="remove-singer" onClick={props.removeSinger}>Remove</i>
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