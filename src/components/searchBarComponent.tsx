import { useSelector, useDispatch } from 'react-redux'
import {
  updateSearchParam,
  selectSearchType,
  selectSearchParam,
} from '../store/appSlice'
import { RemoveIcon } from './RemoveButton'

const SearchBar = () => {
  const dispatch = useDispatch()

  const searchType = useSelector(selectSearchType)
  const searchParam = useSelector(selectSearchParam)

  const updateSearchParameter = (value: string) => {
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
