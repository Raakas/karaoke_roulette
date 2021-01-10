import React from 'react';

const MessageComponent = ({message}, props) => {
    return (
        <div className='message'>
            <h2>{message.title}</h2>
            <p>{message.content}</p>
            <br/>
                <button 
                    className='button button-green'
                    onClick={props.setModalVisibility}
                >
                    Ok
                </button>
            <br/>
        </div>
    )
}

export default MessageComponent;