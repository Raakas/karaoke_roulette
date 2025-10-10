import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  selectYoutubeApiError,
  updateSetMessage,
  selectMessage,
} from '../store/App.slice'

const MessageComponent = () => {
  const dispatch = useDispatch()

  const youtubeApiError = useSelector(selectYoutubeApiError)
  const message = useSelector(selectMessage)
  const { timer, isErrorMessage, title } = message

  const [seconds, setSeconds] = useState(timer)

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1)
      }
    }, 1000)
    return () => {
      clearInterval(myInterval)
    }
  }, [isErrorMessage, seconds])

  const closeMessageModal = () => {
    dispatch(
      updateSetMessage({
        title: '',
        message: '',
        isErrorMessage: false,
        timer: 0,
      }),
    )
  }

  if (!title) return null

  return (
    <div className="message">
      {youtubeApiError || isErrorMessage ? null : (
        <p className="close" onClick={() => closeMessageModal()}>
          X
        </p>
      )}

      <h2>{message.title}</h2>
      <p>{message.message}</p>

      {seconds === 0 ? null : <h1> {seconds}</h1>}

      <div className="buttons">
        <Link to="/" onClick={() => closeMessageModal()}>
          <button className="button button-grey">Back</button>
        </Link>
        {youtubeApiError || isErrorMessage || seconds > 0 ? null : (
          <>
            <button
              className="button button-grey"
              onClick={() => closeMessageModal()}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default MessageComponent
