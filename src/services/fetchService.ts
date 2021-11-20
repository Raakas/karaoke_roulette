
import axios from 'axios';
import { Song, Track, updateTrackList } from '../store/App.slice';
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

const YOUTUBE_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_URL_EMBED = 'https://www.youtube.com/embed/';
const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
})

export class ApiFetchService {

    /*
    saveProject(project: Project): Promise<Project> {
        const projectEntity = new ProjectModel(project);
        return projectEntity.save().then(entity => Project.fromModel(entity));
    }
    */

    fetchTracklistFromAPI = async (searchParam: string, searchType: string) => {
        let results: any = Array<Track>();
    
        try {
          let response = await axios.get(`${LASTFM_URL}?method=${searchType}.gettoptracks&${searchType}=${searchParam}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`);
          let APIRESPONSETRACKLIST: Array<Song> = Array<Song>();
    
          if(searchType === 'artist'){
            APIRESPONSETRACKLIST = response.data.toptracks.track
          }
          else {
            APIRESPONSETRACKLIST = response.data.tracks.track
          }
    
          for (let i in APIRESPONSETRACKLIST) {
            results[i] = APIRESPONSETRACKLIST[i].artist.name + ', ' + APIRESPONSETRACKLIST[i].name;
          }
        }
        catch (error) {
          console.log(error);
        }

        return results
      }

      getSongFromDatabase = async (title: any, searchParam: any) => {
        const db = firebase.firestore();

        // replace all slashes for querying, but do not save these versions to db
        let q_title = title.replaceAll('/', ' ').replaceAll('\ ', ' ')
        let q_searchParam = searchParam.replaceAll('/', ' ').replaceAll('\ ', ' ')

        let source = await db.collection('good_songs').doc(q_searchParam).collection(q_title).doc('details')
          .get()
          .then(function (doc) {
            if (doc.exists) {
              console.log('doc exists')
              let data = doc.data()
              console.log(data)
              if(data){
                return data.source;
              }
              return ''
            } 
            else {
              return doc.data();
            }
          })
          .catch(function (error) {
          });

          return source
    
      }

      
  getSongFromYoutube = async (title: string, trackList: Array<Track>) => {
    let YoutubeResponse = {source: '', counter: 0}

    /*
    let errors = state.errorCounter
    if (errors >= state.errorLimit) {
      this.setMessageModal('Too many errors, try something else', true)
      this.setState({
        youtubeApiError: true
      })
      return;
    }
    */

    const youtubeVideos: any = [];
        
    let res: any = await axios.get(`${YOUTUBE_URL_REQUEST}?part=snippet&key=${process.env.REACT_APP_YOUTUBE_API_KEY}&q=karaoke+${title}&type=video&videoEmbeddable=true&safeSearch=strict`)
    
    /*
    let i = 0;
    if (res.error) {
      console.log(res.error);
      errors++
      this.setMessageModal('Youtube api error', true)
      this.setState({
        youtubeApiError: true,
        trackList: [],
        errorCounter: errors,
      })
      return;
    }

    if (res.items === undefined || res.items === 'undefined' || res.items.length === 0) {
      errors++
      this.setMessageModal(title + ' not found')
      this.setState({
        errorCounter: errors,
      })
      return;
    }
    */

    let test = title.split(',')
    let artist = test[0].toLowerCase()
    let track = test[1].toLowerCase().trim()
    for (let i in res.data.items) {
      let string = res.data.items[i].snippet.title.toLowerCase()

      if(string.includes(artist) && string.includes(track) && string.includes('karaoke') && !string.includes('cover')){
          youtubeVideos.push(YOUTUBE_URL_EMBED + res.data.items[i].id.videoId);
        }
    }

    if(youtubeVideos.length > 0){
      YoutubeResponse = {source: youtubeVideos[0], counter: youtubeVideos.length}
    }

    return YoutubeResponse
    //saveToDatabase(title, youtubeVideos[0])
  }
    
}