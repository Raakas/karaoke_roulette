const api = require('../json/api.json');
const lastFmData = require('../json/lastfm.json');

const ROOT_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const ROOT_URL_EMBED = 'https://www.youtube.com/embed';
const data = [];

export default function getSong(){

    for(let i in lastFmData.tracks.track){
        data[i] = lastFmData.tracks.track[i].artist.name + " - " + lastFmData.tracks.track[i].name;
    }

    let nmbr = Math.floor(Math.random() * 50);

    const track = data[nmbr];


    if(window.localStorage.getItem(track)){
      return window.localStorage.getItem(track);
    }
    else {
      fetch(`${ROOT_URL_REQUEST}?part=snippet&key=${api.keys[0].youtube}&q=karaoke+${track}&type=video`)
      .then(response => response.json())
      .then(res => {
        console.log(res)
        let source = ROOT_URL_EMBED + "/" + res.items[0].id.videoId;
        
        window.localStorage.setItem(track, source);

        console.log(source)
        return source;

    })
    .catch(error => {
        console.log(error);
        getSong();
      });
    }
}