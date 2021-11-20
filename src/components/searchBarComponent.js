import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';

const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/';

const SearchBar = (props) => {
    
    const state = useSelector(initialState => initialState);
    const dispatch = useDispatch();

    const updateSearchParam = (event) => {
        if(event === undefined || event === ''){
          return;
        }
    
        let string = event.target ? event.target.value.toLowerCase().trim() : event
    
        dispatch({
          searchParam: string
        })
    
        if(string === ''){
          dispatch({
            trackList: []
          })
        }
      }

    const [searchMatches, setSearchMatches] = useState([]);
    const [query, setQuery] = useState('')

    useEffect(()=>{
        resetQuery();
    },[props.searchType])

    const getQueryParameter = (value) => {
        if (value === '' || value === ' ' || value === null || value === undefined) {
            resetQuery();
        }
        else if(value.length > 6){
            let results = searchMatches.filter(a => a.name.toLowerCase().includes(value.toLowerCase()))
            setSearchMatches(results)
        }
        else if(value.length > query.length){
            fetchSearcResultsFromAPI(value)
        }
        updateSearchParam(value)
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
        updateSearchParam(result)
        props.fetchTracklist(result)
    }

    const resetQuery = () => {
        setQuery('')
        setSearchMatches([])
        document.getElementById('song-input').value = ''
        updateSearchParam('')
    }

    return (
        <>
            <input 
                id='song-input'
                type='text' 
                value={props.value} 
                onChange={(e) => getQueryParameter(e.target.value)} 
                placeholder={`Type in ${props.searchType === 'tag' ? 'genre' : 'artist'}`}
            />
            {query 
                ? <a className="reset-button" onClick={() => resetQuery()}>X</a> 
                : null
            }
            {searchMatches &&
                <div className="dropdown">
                    <div class="results">
                        {searchMatches.map(item => (
                            <p className="text-tiny" onClick={() => setSearchResult(item.name)}>{item.name}</p>
                        ))}
                    </div>
                </div>
            }
        </>
    )
}

export default SearchBar