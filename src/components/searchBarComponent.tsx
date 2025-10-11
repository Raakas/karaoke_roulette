import { useSelector, useDispatch } from 'react-redux'
import {
  updateSearchParam,
  updateTrackList,
  selectSearchType,
  selectSearchParam,
} from '../store/appSlice'
import { RemoveIcon } from './RemoveButton'

const SearchBar = () => {
  const dispatch = useDispatch()

  const searchType = useSelector(selectSearchType)
  const searchParam = useSelector(selectSearchParam)

  const isEmpty = (param: string): boolean => !param || param.length === 0

  const updateSearchParameter = (value: string) => {
    if (isEmpty(value)) {
      dispatch(updateSearchParam(''))
      dispatch(updateTrackList([]))
      return
    }

    dispatch(updateSearchParam(value))
  }

  const resetSearch = () => {
    dispatch(updateSearchParam(''))
  }

  return (
    <div className="search-bar">
      <div className="search-controls">
        <input
          className="song-input"
          type="text"
          value={searchParam}
          onChange={(e) => updateSearchParameter(e.target.value)}
          placeholder={`Type in ${searchType}`}
        />
        {searchParam && <RemoveIcon id={Number.NaN} onClick={resetSearch} />}
      </div>
    </div>
  )
}

export default SearchBar
