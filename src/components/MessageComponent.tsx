import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateSetMessage } from '../store/App.slice'
import { RootState } from '../store/store'

const MessageComponent = () => {
    const state = useSelector((initialState: RootState) => initialState.data)
    const dispatch = useDispatch()
    const [seconds, setSeconds] = useState(state.message.timer)

    useEffect(() => {
        let myInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1)
            }
        }, 1000)
        return () => {
            clearInterval(myInterval)
        }
    }, [state.message.isErrorMessage, seconds])

    const closeMessageModal = () => {
        dispatch({
            type: updateSetMessage,
            payload: {
                title: '',
                message: '',
                isErrorMessage: false,
                timer: 0,
            }
        })
    }

    return (
        <div className='message'>
            {state.youtubeApiError || state.message.isErrorMessage
                ? null
                : <p className="close" onClick={() => closeMessageModal()}>X</p>
            }
            <h2>{state.message.title}</h2>
            <p>{state.message.message}</p>
            {seconds === 0
                ? null
                : <h1> {seconds}</h1>
            }
            <br />
            <div className="buttons">
                <Link to='/' onClick={() => closeMessageModal()}>
                    <button className='button button-grey'>Back</button>
                </Link>
                {state.youtubeApiError || state.message.isErrorMessage || seconds > 0
                    ? null
                    : <>
                        <button className='button button-grey' onClick={() => closeMessageModal()}>Close</button>
                    </>
                }
            </div>
            <br />
        </div>
    )
}

export default MessageComponent