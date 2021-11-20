import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { updateSearchParam } from '../store/App.slice';

const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/';

const SearchBar = (props) => {
    
    const state = useSelector(initialState => initialState);
    const dispatch = useDispatch();

    const updateSearchParameter = (event) => {
        if(event === undefined || event === ''){
          return;
        }
    
        let string = event.target ? event.target.value.toLowerCase().trim() : event

        dispatch({type: updateSearchParam, payload: string  })
    
        if(string === ''){
          dispatch({
            trackList: []
          })
        }
      }

    const [searchMatches, setSearchMatches] = useState([]);

    useEffect(()=>{
        resetQuery();
    },[state.searchType])

    const getQueryParameter = (value) => {
        if (value === '' || value === ' ' || value === null || value === undefined) {
            resetQuery();
        }
        else if(value.length > 6){
            let results = searchMatches.filter(a => a.name.toLowerCase().includes(value.toLowerCase()))
            setSearchMatches(results)
        }
        else {
            fetchSearcResultsFromAPI(value)
        }
        updateSearchParameter(value)
    }

    const fetchSearcResultsFromAPI = async (value) => {


        if (value === '' || value === ' ' || value === null || value === undefined) {
            resetQuery();
        }
        else {
            try {
                let method_url = ''

                if(props.searchType === 'artist'){
                    method_url = 'method=artist.search&artist=' + value
                }
                else {
                    method_url = 'method=tag.getTopTags'
                }

                let res = await axios.get(`${LASTFM_URL}?${method_url}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`);

                let results = []

                if(props.searchType === 'artist'){
                    results = res.data.results.artistmatches.artist
                }
                else {
                    results = res.data.toptags.tag

                    results = results.filter(a => a.name.toLowerCase().includes(value.toLowerCase()))
                }
                setSearchMatches(results);
            }
            catch (error) {
                console.log(error);
                resetQuery();
            }
        }
    }

    const setSearchResult = (result) => {
        setSearchMatches([])
        document.getElementById('song-input').value = result
        updateSearchParameter(result)
        props.fetchTracklist(result)
    }

    const resetQuery = () => {
        setSearchMatches([])
        document.getElementById('song-input').value = ''
        updateSearchParameter('')
    }

    return (
        <>
            <input 
                id='song-input'
                type='text' 
                value={state.searchParam} 
                onChange={(e) => getQueryParameter(e.target.value)} 
                placeholder={`Type in ${props.searchType === 'tag' ? 'genre' : 'artist'}`}
            />
            {state.searchParam 
                ? <a className="reset-button" onClick={() => resetQuery()}>X</a> 
                : null
            }
            {searchMatches &&
                <div className="dropdown">
                    <div className="results">
                        {searchMatches.map(item => (
                            <p 
                                className="text-tiny" 
                                key={item.name} onClick={() => setSearchResult(item.name)}
                            >
                                {item.name}
                            </p>
                        ))}
                    </div>
                </div>
            }
        </>
    )
}

export default SearchBar