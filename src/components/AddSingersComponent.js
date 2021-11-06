import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';

const AddSingersComponent = (props) => {
    let unmotivating_catchphrases_for_the_curious = [
        `Really? What's the point!?`,
        'Is this what you really want?',
        'Why not just stop singing altogether?',
        `Hehe, doesn't matter if you are alone...`,
        `Just grab the mic!`,
        'You can consider this an easter egg',
    ]
    let all_singers = []
    let i = 0

    while(i < props.singerAmount){
        if(props.singerQueue !== undefined && props.singerQueue[i] !== undefined){
            all_singers.push({id: props.singerQueue[i].id, name: props.singerQueue[i].name, saved:true})
        }
        else {
            let random = Math.floor(Math.random() * 1000)
            all_singers.push({id:random, name:'Singer ' + (i + 1), saved:false})
        }
        i++
    }

    const [singers, setSingers] = useState([])
    const [random, setRandom] = useState(0)

    useEffect(()=>{setSingers(props.singerQueue)},[props.singerQueue])

    const addSinger = (item) => {
        let singerQueue = singers

        let match = singerQueue.find(a => a.id === parseInt(item.id))

        if(match !== undefined){
            singerQueue = singerQueue.filter(a => a !== match)
        }

        if(item.value.trim() !== ''){
            let singer = {
                id: parseInt(item.id),
                name: item.value.trim(),
                saved: true
            }
            singerQueue.push(singer)
            setSingers(singerQueue)
            return props.saveSingers(singerQueue)
        }
    }

    const removeSinger = (id) => {
        let singerQueue = singers.filter(a => a.id !== id)
        let element = document.getElementById(id)
        element.value = ''
        return props.saveSingers(singerQueue)
    }

    const clearSingers = () => {
        let elements = document.querySelectorAll('input')
        let i = 1
        for(let e of elements){
            e.value = ''
            e.placeholder = 'Singer ' + i
            i++
        }
        setSingers([])
        all_singers = []
        return props.saveSingers([])
    }

    const removeSingersButton = () => {
        if(props.singerAmount <= singers.length){
            setRandom(Math.random())
            return;
        }
        else {
            return props.ReduceSingerAmount();
        }
    }

    return (
        <div className='start__center'>
            <h1>Karaoke Roulette</h1>
            <p>Add singers: </p>
            <br/>
            {all_singers.length > 0
                ? all_singers.map((item, index)=>(
                    <div key={index} className="singer-list">
                        <input 
                            id={item ? item.id : index}
                            type='text' 
                            value={props.value}
                            onBlur={(e) => addSinger(e.target)}
                            placeholder={item ? item.name: `Singer ${index}`}
                        />
                        {item.saved
                            ? <p class="remove-icon" id={item ? item.id : index} onClick={() => removeSinger(item.id)}>X</p>
                            : null
                        }
                        <br/>
                    </div>
                ))
                : <p>{unmotivating_catchphrases_for_the_curious[Math.floor(random * unmotivating_catchphrases_for_the_curious.length)]}</p>
            }
            <div className="buttons-container">
                <div className="buttons-row">
                    <button className="button button-yellow" onClick={() => removeSingersButton()}>
                        -
                    </button>
                    <button className="button button-yellow" onClick={() => props.addSingerAmount()}>
                        +
                    </button>
                </div>
                <br/>
                <div className="buttons">
                    <button className='button button-grey' onClick={() => clearSingers()}>Clear all</button>
                    <Link to='start'>
                        <button className='button button-blue'>Ready</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AddSingersComponent;