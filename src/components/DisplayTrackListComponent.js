import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { updateTrackList } from '../store/App.slice';

const DisplayTrackListComponent = () => {
    
    const state = useSelector(initialState => initialState.data);
    const dispatch = useDispatch();

    const removeTrack = (index) => {
        let results = state.trackList
        results = [...results.slice(0, index), ...results.slice(index + 1)];
        dispatch({
            type: updateTrackList, payload: results
        })
    }

    return (
        <div className="tracklist">
            {state.trackList.length > 0
                ? <>
                    <div className="tracklist__track">
                        <p className="text-micro">Woah! Keep in mind Youtube quality might be shit...</p>
                    </div>
                    <br/>
                    {state.trackList.map((item, index) => (
                        <div className="tracklist__track">
                            <p className="remove-icon small" onClick={() => removeTrack(index)}>X</p>
                            <p className="text-micro" key={index}>
                                {state.apiError ? Object.keys(item)[0] : item}
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