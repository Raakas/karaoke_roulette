
import axios from 'axios';
import { Song, Track } from '../store/App.slice';
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

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
    
}