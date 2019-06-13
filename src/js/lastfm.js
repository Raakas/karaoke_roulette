const lastFmData = require('../json/lastfm.json');
const data = [];

export function getLastFm() {
    for(let i in lastFmData.tracks.track){
        data[i] = lastFmData.tracks.track[i].name;
    }
    console.log(data);
    return data;
}