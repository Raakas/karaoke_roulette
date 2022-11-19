
import axios from 'axios'
import { FirestoreError, LastFmApiResponse, Song, YoutubeApiResponse } from '../store/App.slice'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import { Console } from 'console'

const YOUTUBE_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search'
const YOUTUBE_URL_EMBED = 'https://www.youtube.com/embed/'
const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/'

let SEARCH_PARAM: string = ''
let SEARCH_TYPE: string = ''
let TITLE: string = ''

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
})

export class ApiFetchService {

  urlSwitch = (urlTypeParam: string): string => {
    let url: string = ''

    switch (urlTypeParam) {
      case 'tag':
        url = `${LASTFM_URL}?method=${SEARCH_TYPE}.gettoptags&${SEARCH_TYPE}=${SEARCH_PARAM}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`
        break
      case 'artist':
        url = `${LASTFM_URL}?method=artist.search&artist=${SEARCH_PARAM}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`
        break
      case 'track':
        url = `${LASTFM_URL}?method=${SEARCH_TYPE}.gettoptracks&${SEARCH_TYPE}=${SEARCH_PARAM}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`
        break
      case 'youtube':
        url = `${YOUTUBE_URL_REQUEST}?part=snippet&key=${process.env.REACT_APP_YOUTUBE_API_KEY}&q=karaoke+${TITLE}&type=video&videoEmbeddable=true&safeSearch=strict`
        break
      default:
        console.log("Url doesn't match any known patterns")
    }

    return url
  }

  axiosFetcher = async (urlParam: string): Promise<any> => {
    return axios.get(this.urlSwitch(urlParam)).catch(error => console.log(error))
  }

  lastFmTrackFetcher = async (searchParam: string, searchType: string): Promise<Array<Song>> => {
    SEARCH_PARAM = searchParam
    SEARCH_TYPE = searchType
    let results: any = Array<Song>()

    try {
      let response = await this.axiosFetcher('track')
      let APIRESPONSETRACKLIST: Array<Song> = Array<Song>()

      if (searchType === 'artist') {
        APIRESPONSETRACKLIST = response.data.toptracks.track
      }
      else {
        APIRESPONSETRACKLIST = response.data.tracks.track
      }

      for (let i in APIRESPONSETRACKLIST) {
        results[i] = {
          name: APIRESPONSETRACKLIST[i].artist.name + ', ' + APIRESPONSETRACKLIST[i].name,
          artist: {
            name: APIRESPONSETRACKLIST[i].artist.name
          },
          source: ''
        }
      }
    }
    catch (error) {
      console.log(error)
    }

    return results
  }

  fetchTracklist = async (searchParam: string, youtubeApiError: boolean, title: string, source: string, searchType: string): Promise<Array<Song>> => {
    let tracks: Array<Song> = []

    if (youtubeApiError) {
      tracks = await this.fetchTracklistFromDatabase()
    }
    else if (!searchParam || searchParam.length === 0) {
      return []
    }
    else if (title && source) {
      let split = title.split(',')
      let artist = split[0]
      let track = split[1]
      //get similar tracks from api. 
      tracks = await this.lastFmTrackFetcher(artist, track)
    }
    else {
      tracks = await this.lastFmTrackFetcher(searchParam, searchType)
    }

    if (tracks.length <= 0) {
      //this.setMessageModal('No tracks found from LastFM API, try again', true)
      return []
    }

    return tracks
  }

  getSongFromDatabase = async (title: string, searchParam: string): Promise<string> => {
    const db = firebase.firestore()

    // replace all slashes for querying, but do not save these versions to db
    let q_title = title.replaceAll('/', ' ').replaceAll('\ ', ' ')
    let q_searchParam = searchParam.replaceAll('/', ' ').replaceAll('\ ', ' ')

    // raise and show error
    if(!!q_title === false || !!q_searchParam === false) return ''
    
    return await db.collection('good_songs').doc(q_searchParam).collection(q_title).doc('details')
      .get()
      .then(function (doc) {
        if (doc.exists) {
          let data = doc.data()
          if (data) {
            return data.source
          }
          return ''
        }
        else {
          return doc.data()
        }
      })
      .catch(function (error) {
      })
  }

  fetchTracklistFromDatabase = async (): Promise<Array<Song>> => {
    const db = firebase.firestore()

    // iterate database and push track title and sources to results
    let searchType = ['artists', 'genre']
    let results: Array<Song> = []

    for (let type of searchType) {
      await db.collection(type).get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            let tracks = doc.data()

            for (let track in tracks) {
              //results.push({[track]: tracks[track].split('?')[0]})
              results.push({
                name: track,
                artist: {
                  name: doc.id
                },
                source: tracks[track].split('?')[0],
              })
            }

          })
        })
    }

    return Promise.resolve(results)
  }

  saveToDatabase = (title: string, source: string, searchType: string, searchParam: string): Promise<FirestoreError> => {
    if(!!title === false || !!source === false || !!searchParam === false){
      return Promise.resolve({ error: false, message: '' })
    }
    const db = firebase.firestore()

    db.collection(searchType === 'artist' ? 'artists' : 'genre').doc(searchParam).set({
      [title]: source
    }, { merge: true })
      .catch(error => {
        console.error(error)
        return { message: `Error adding song ${title} to database`, error: true }
      })

    return Promise.resolve({ error: false, message: '' })
  }

  getSongFromYoutube = async (title: string): Promise<YoutubeApiResponse> => {
    TITLE = title
    let YoutubeResponse: YoutubeApiResponse = { source: '', counter: 0, error: false, message: '', urls: [] }

    const youtubeVideos: any = []

    let res: any = await this.axiosFetcher('youtube')

    if (res === undefined || res.error) {
      YoutubeResponse.error = true
      YoutubeResponse.message = 'YouTube api error'
      YoutubeResponse.counter = 0
      return YoutubeResponse
    }

    if (res.data.items === undefined || res.data.items === 'undefined' || res.data.items.length === 0) {
      YoutubeResponse.error = true
      YoutubeResponse.message = title + ' not found'
      YoutubeResponse.counter = 0
      return YoutubeResponse
    }

    let test = title.split(',')
    let artist = test.shift()

    if (artist) {
      artist.toLowerCase()
    }

    let track = test.join(' ').toLowerCase().trim().split(`'`)[0]

    for (let i in res.data.items) {
      let title = res.data.items[i].snippet.title.toLowerCase()
      if (title.includes(track) && title.includes('karaoke') && !title.includes('cover')) {
        youtubeVideos.push(YOUTUBE_URL_EMBED + res.data.items[i].id.videoId)
      }
    }

    if (youtubeVideos.length > 0) {
      YoutubeResponse.source = youtubeVideos[0]
      YoutubeResponse.counter = youtubeVideos.length
      YoutubeResponse.error = false
      YoutubeResponse.message = ''
      
      youtubeVideos.shift()
      YoutubeResponse.urls = youtubeVideos
    }

    return YoutubeResponse
  }

  searchBarAPI = async (searchParam: string, searchType: string): Promise<Array<LastFmApiResponse>> => {
    SEARCH_PARAM = searchParam
    SEARCH_TYPE = searchType
    let lastFMResponse: Array<LastFmApiResponse> = new Array()
    try {

      let res

      if (searchType === 'artist') {
        res = await this.axiosFetcher('artist')
        lastFMResponse = res.data.results.artistmatches.artist
        lastFMResponse = lastFMResponse.filter((a: LastFmApiResponse) => a.name.toLowerCase().includes(searchParam.toLowerCase()))
      }
      else {
        res = await this.axiosFetcher('tag')
        lastFMResponse = res.data.toptags.tag

        lastFMResponse = lastFMResponse.filter((a: LastFmApiResponse) => a.name.toLowerCase().includes(searchParam.toLowerCase()))
      }
    }
    catch (error) {
      console.log(error)
    }

    return lastFMResponse
  }

}