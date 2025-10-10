import { useSelector, useDispatch } from 'react-redux'
import { updateTrackList, Song } from '../store/App.slice'
import { RootState } from '../store/store'

const DisplayTrackListComponent = () => {
    //todo: state.apiError ? Object.keys(item)[0] : item eli errorille oma state
    const state = useSelector((state: RootState) => state.data)
    const dispatch = useDispatch()

    const removeTrack = (index: number) => {
        let results = state.trackList
        results = [...results.slice(0, index), ...results.slice(index + 1)]
        dispatch(updateTrackList(results))
    }

    return (
        <div className="tracklist">
            {state.trackList.length > 0
                ? <>
                    <div className="tracklist__track">
                        <p className="text-micro">Woah! Keep in mind Youtube quality might be shit...</p>
                    </div>
                    <br />
                    {state.trackList.map((item: Song, index: number) => (
                        <div className="tracklist__track" key={index}>
                            <p className="remove-icon small" onClick={() => removeTrack(index)}>X</p>
                            <p className="text-micro">
                                {item.name}
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