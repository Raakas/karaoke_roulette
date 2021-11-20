
import axios from 'axios';
import { Song, Track } from '../store/App.slice';

const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/';

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
        console.log('fetch service', results)
        return results
      }
    
}