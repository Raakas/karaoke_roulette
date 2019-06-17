import axios from 'axios';

const URL = 'http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&';
const api = require('../api.json');

export function getLastFm (value) {
    let res;
    axios.get(`${URL}tag=${value}&api_key=${api.keys[1].lastfm}&format=json`)
        .then(response => {
            console.log(response);
            res = response;
        })
        .catch(error => { res = error; });
    return res;
}