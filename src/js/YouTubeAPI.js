import axios from 'axios';

const API_KEY = 'AIzaSyCdnHk5Gvw_laXCyz_ED3M8PxrSsdmaaN8';
const ROOT_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const ROOT_URL_EMBED = 'https://www.youtube.com/embed';

export function getYoutube(value) {
    return axios.get(`${ROOT_URL_REQUEST}?part=snippet&key=${API_KEY}&q=${value}&type=video`)
        .then(response => response)
        .catch(error => console.log(error));
}