import React from 'react'

const DisplayTrackListComponent = (props) => {
    return (
        <div className="tracklist">
            {props.trackList.length > 0
                ? <>
                    <p className="tracklist__track">Woah! Keep in mind Youtube quality might be shit...</p>
                    <br/>
                    {props.trackList.map((item, index) => (
                        <p 
                            key={index}
                            className="tracklist__track"
                        >
                            {props.apiError ? Object.keys(item)[0] : item}
                        </p>
                    ))}
                </>
                : <p className="tracklist__track">No tracks yet</p>
            }
        </div>
    )
}

export default DisplayTrackListComponent