import { useSelector } from 'react-redux'
import { selectSingerQueue } from '../store/App.slice'

const CurrentSingersComponent = () => {
  const singerQueue = useSelector(selectSingerQueue)

  return (
    <>
      {singerQueue.length > 0 ? (
        <div className="start__singers">
          <p className="text-tiny">Current singers:</p>
          {singerQueue.map((item, index) => (
            <p className="text-tiny" key={index}>
              {' '}
              {item.name}{' '}
            </p>
          ))}
        </div>
      ) : null}
    </>
  )
}

export default CurrentSingersComponent
