import React from 'react';
import {Link} from 'react-router-dom';

const MessageComponent = (props) => {
    return (
        <div className='message'>
            <p className="close" onClick={() => props.setErrorModal(false)}>X</p>
            <h2>{props.message.title}</h2>
            <p>{props.message.message}</p>
            <br/>
            <div className="buttons">
                <Link to='start' onClick={() => props.setErrorModal(false)}>
                    <button className='button button-grey'>Back</button>
                </Link>
                {props.apiError
                    ? null
                    : <>
                        <button className='button button-grey' onClick={() => props.setErrorModal(false)}>Close</button>
                        <button className='button button-green' onClick={props.getSong}>New song</button>
                    </>
                }
            </div>
            <br/>
        </div>
    )
}

export default MessageComponent;