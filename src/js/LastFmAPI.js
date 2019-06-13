import axios from 'axios';

const URL = 'http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&';
const API_KEY = '16203e6d3ef2c183a3621b4a4e92e86c';

export function getLastFm (value) {
    let res;
    axios.get(`${URL}tag=${value}&api_key=${API_KEY}&format=json`)
        .then(response => {
            console.log(response);
            res = response;
        })
        .catch(error => { res = error; });
    return res;
}