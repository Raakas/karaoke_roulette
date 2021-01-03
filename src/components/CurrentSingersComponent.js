import React from 'react';

const CurrentSingersComponent = (props) => {

    return (
        <div className="start__singers">
            <p className="text-tiny">Current singers:</p>
            {props.queue.map((item, index) => (
                <p className="text-tiny" key={index}>{item.name}</p>
            ))}
        </div>
    )
}

export default CurrentSingersComponent;