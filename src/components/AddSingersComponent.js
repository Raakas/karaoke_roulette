import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';

const AddSingersComponent = (props) => {
    let all_singers = []
    let i = 0

    while(i < props.singerAmount){
        if(props.queue !== undefined && props.queue[i] !== undefined){
            all_singers.push({id: props.queue[i].id, name: props.queue[i].name, saved:true})
        }
        else {
            let random = Math.floor(Math.random() * 1000)
            all_singers.push({id:random, name:'Singer ' + (i + 1), saved:false})
        }
        i++
    }

    return (
        <div className='add-singers'>
            <h1>Karaoke Roulette</h1>
            <p>Add singers: </p>
            <br/>
            {all_singers.map((item, index)=>(
                <div key={index}>
                    <input 
                        id={item ? item.id : index}
                        type='text' 
                        value={props.value}
                        onBlur={props.addSinger}
                        placeholder={item ? item.name: `Singer ${index}`}
                    />
                    {item.saved
                        ? <i id={item ? item.id : index} onClick={props.removeSinger}>Clear</i>
                        : null
                    }
                    <br/>
                </div>
            ))}
            <div>
                <button className="button button-yellow" onClick={() => props.ReduceSingerAmount()}>
                    -
                </button>
                <button className="button button-yellow" onClick={() => props.addSingerAmount()}>
                    +
                </button>
            </div>
            <br/>
            <Link to='start'>
                <button className='button button-grey'>Back</button>
            </Link>
            <button className='button button-blue' onClick={props.resetSingers}>Reset</button>
            <Link to='start' onClick={props.saveSingers}>
                <button className='button button-orange'>Save</button>
            </Link>
        </div>
    )
}

export default AddSingersComponent;