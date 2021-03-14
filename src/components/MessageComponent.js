import React from 'react';
import {Link} from 'react-router-dom';

const MessageComponent = (props) => {
    return (
        <div className='message'>
            <h2>{props.message.title}</h2>
            <p>{props.message.message}</p>
            <br/>
            <Link to='start' onClick={() => props.setModalVisibility(false)}>
                <button className='button button-grey'>Ok</button>
            </Link>
            <br/>
        </div>
    )
}

export default MessageComponent;