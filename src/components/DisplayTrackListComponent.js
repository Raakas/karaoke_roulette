import React from 'react'

const DisplayTrackListComponent = (props) => {
    return (
        <div className="tracklist">
            {props.trackList.length > 0
                ? <>
                    <div className="tracklist__track">
                        <p className="text-micro">Woah! Keep in mind Youtube quality might be shit...</p>
                    </div>
                    <br/>
                    {props.trackList.map((item, index) => (
                        <div className="tracklist__track">
                            <p className="remove-icon small" onClick={() => props.removeTrack(index)}>X</p>
                            <p className="text-micro" key={index}>
                                {props.apiError ? Object.keys(item)[0] : item}
                            </p>
                        </div>
                    ))}
                </>
                : <div className="tracklist__track">No tracks yet</div>
            }
        </div>
    )
}

export default DisplayTrackListComponent