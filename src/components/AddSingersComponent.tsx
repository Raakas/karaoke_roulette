import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  clearSingers,
  selectSingerAmount,
  selectSingerQueue,
  Singer,
  updateSingerAmount,
  updateSingers,
} from '../store/App.slice'

const AddSingersComponent = () => {
  const dispatch = useDispatch()

  const singerAmount = useSelector(selectSingerAmount)
  const singerQueue = useSelector(selectSingerQueue)

  const [singerPlaceHolders, setSingerPlaceHolders] = useState<Array<Singer>>(
    [],
  )
  const [random, setRandom] = useState<number>()

  useEffect(() => {
    // fill inputs first with placeholders and save them to local component state
    // store singers to global state as user writes name
    // fill input fields with singers from global state if found

    let all_singers = []
    let i = 0

    while (i < singerAmount) {
      if (singerQueue !== undefined && singerQueue[i] !== undefined) {
        let singer = singerQueue[i]
        all_singers.push({
          id: singer.id,
          name: singer.name,
          saved: singer.saved,
        })
      } else {
        let next_singer_id: number =
          all_singers.length >= 1
            ? all_singers[all_singers.length - 1].id + 1
            : i
        all_singers.push({
          id: next_singer_id,
          name: '',
          saved: false,
        })
      }
      i++
    }

    all_singers = all_singers.sort((a: Singer, b: Singer) => a.id - b.id)
    setSingerPlaceHolders(all_singers)
  }, [singerQueue, singerAmount])

  let unmotivating_catchphrases_for_the_curious = [
    `Really? What's the point!?`,
    'Is this what you really want?',
    'Why not just stop singing altogether?',
    `Hehe, doesn't matter if you are alone...`,
    `Just grab the mic!`,
    'You can consider this an easter egg',
    'Hangovers only come to those who get sober!',
  ]

  const singerAmountUpdater = (amount: number) => {
    dispatch(updateSingerAmount(amount))
  }

  const addSinger = (item: any) => {
    let singerQueue = [...singerPlaceHolders]

    if (singerQueue) {
      const match = singerQueue.find((a) => a.id === parseInt(item.id))

      if (match !== undefined) {
        singerQueue = singerQueue.filter((a) => a !== match)
      }

      if (item.value.trim() !== '') {
        let singer = {
          id: parseInt(item.id),
          name: item.value.trim(),
          saved: true,
        }
        singerQueue.push(singer)

        dispatch(updateSingers(singerQueue.filter((x) => x.name !== '')))
      }
    }
  }

  const removeSinger = (id: any) => {
    let singerQueue
    if (singerQueue) singerQueue = singerPlaceHolders.filter((a) => a.id !== id)
    if (!singerQueue) return
    dispatch(updateSingers(singerQueue))
  }

  const clearAllSingers = () => {
    dispatch(clearSingers(true))
  }

  const removeSingersButton = () => {
    if (singerAmount >= 1) {
      let latest_singer_id =
        singerPlaceHolders[singerPlaceHolders.length - 1].id
      let id_to_be_removed = singerAmount - 1

      singerAmountUpdater(id_to_be_removed)
      removeSinger(latest_singer_id)
    } else {
      setRandom(Math.random())
    }
  }

  return (
    <div className="start__center">
      <h1>Karaoke Roulette</h1>
      <p>Add singers: </p>
      <br />
      {singerAmount > 0 ? (
        singerPlaceHolders?.map((item, index) => (
          <div key={index} className="singer-list">
            <input
              id={item ? `${item.id}` : `${index}`}
              type="text"
              value={item.name}
              placeholder={`Singer ${index + 1}`}
              onChange={(e) => addSinger(e.target)}
            />
            {item.saved ? (
              <p
                className="remove-icon"
                id={item ? `${item.id}` : `${index}`}
                onClick={() => removeSinger(item.id)}>
                X
              </p>
            ) : null}
            <br />
          </div>
        ))
      ) : (
        <p>
          {
            unmotivating_catchphrases_for_the_curious[
              Math.floor(
                random! * unmotivating_catchphrases_for_the_curious.length,
              )
            ]
          }
        </p>
      )}
      <div className="buttons-container">
        <div className="buttons-row">
          <button
            className="button button-yellow"
            onClick={() => removeSingersButton()}>
            -
          </button>
          <button
            className="button button-yellow"
            onClick={() => singerAmountUpdater(singerAmount + 1)}>
            +
          </button>
        </div>
        <br />
        <div className="buttons">
          <button
            className="button button-grey"
            onClick={() => clearAllSingers()}>
            Clear all
          </button>
          <Link to="/">
            <button className="button button-blue">Ready</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AddSingersComponent
