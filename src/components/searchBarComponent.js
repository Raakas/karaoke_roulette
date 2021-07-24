import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/';

const SearchBar = (props) => {

    const [searchMatches, setSearchMatches] = useState([]);
    const [query, setQuery] = useState('')

    useEffect(()=>{
        resetQuery();
    },[props.type])

    const getQueryParameter = (value) => {
        if (value === '' || value === ' ' || value === null || value === undefined) {
            resetQuery();
        }
        else if(value.length < 4 && value.length > query.length){
            fetchSearcResultsFromAPI(value)
        }
        props.updateGenre(value)
    }

    const fetchSearcResultsFromAPI = async (value) => {


        if (value === '' || value === ' ' || value === null || value === undefined) {
            resetQuery();
        }
        else {
            try {
                setQuery(value)
                let method_url = ''

                if(props.type === 'artist'){
                    method_url = 'method=artist.search&artist=' + value
                }
                else {
                    method_url = 'method=tag.getTopTags'
                }

                let res = await axios.get(`${LASTFM_URL}?${method_url}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`);

                let results = []

                if(props.type === 'artist'){
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
        props.updateGenre(result)
        props.fetchTracklist(result)
    }

    const resetQuery = () => {
        setQuery('')
        setSearchMatches([])
        document.getElementById('song-input').value = ''
        props.updateGenre('')
    }
    
    return (
        <>
            <input 
                id='song-input'
                type='text' 
                value={props.value} 
                onChange={(e) => getQueryParameter(e.target.value)} 
                placeholder={`Type in ${props.type === 'tag' ? 'genre' : 'artist'}`}
            />
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