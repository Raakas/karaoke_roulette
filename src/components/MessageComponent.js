import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';

const MessageComponent = (props) => {
    
    const initialSeconds = props.message.timer
    const [seconds, setSeconds ] =  useState(initialSeconds);

    useEffect(()=>{
        let myInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
        }, 1000)
        return ()=> {
            clearInterval(myInterval);
          };
    });

    return (
        <div className='message'>
            {props.youtubeApiError || props.message.error
                ? null
                : <p className="close" onClick={() => props.setMessageModal(false)}>X</p>
            }
            <h2>{props.message.title}</h2>
            <p>{props.message.message}</p>
            { seconds === 0
                ? null
                : <h1> {seconds < 10 ?  `${seconds}` : seconds}</h1> 
            }
            <br/>
            <div className="buttons">
                <Link to='start' onClick={() => props.setMessageModal(false)}>
                    <button className='button button-grey'>Back</button>
                </Link>
                {props.youtubeApiError || props.message.error || seconds > 0
                    ? null
                    : <>
                        <button className='button button-grey' onClick={() => props.setMessageModal(false)}>Close</button>
                        <button className='button button-green' onClick={props.getSong}>New song</button>
                    </>
                }
            </div>
            <br/>
        </div>
    )
}

export default MessageComponent;