import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

const CurrentSingersComponent = () => {
    const state = useSelector((initialState: RootState) => initialState.data)

    return (
        <>
            {
                state.singerQueue.length > 0
                    ? <div className='start__singers'>
                        <p className='text-tiny'>Current singers:</p>
                        {
                            state.singerQueue.map((item, index) => (
                                <p className='text-tiny' key={index} > {item.name} </p>
                            ))
                        }
                    </div>
                    : null
            }
        </>
    )
}

export default CurrentSingersComponent