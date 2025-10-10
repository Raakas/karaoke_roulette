import axios from 'axios'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

import {
  FirestoreError,
  LastFmApiResponse,
  Song,
  YoutubeApiResponse,
} from '../store/App.slice'
import { filterYoutubeResponseTitle } from '../utils'

const YOUTUBE_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search'
const YOUTUBE_URL_EMBED = 'https://www.youtube.com/embed/'
const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/'

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
})

export class ApiFetchService {
  urlSwitch = (
    urlTypeParam: string,
    searchParam?: string,
    searchType?: string,
    songTitle?: string,
  ): string => {
    let url: string = ''

    switch (urlTypeParam) {
      case 'tag':
        url = `${LASTFM_URL}?method=${searchType}.gettoptags&${searchType}=${searchParam}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`
        break
      case 'artist':
        url = `${LASTFM_URL}?method=artist.search&artist=${searchParam}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`
        break
      case 'track':
        url = `${LASTFM_URL}?method=${searchType}.gettoptracks&${searchType}=${searchParam}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`
        break
      case 'youtube':
        url = `${YOUTUBE_URL_REQUEST}?part=snippet&key=${process.env.REACT_APP_YOUTUBE_API_KEY}&q=karaoke+${songTitle}&type=video&videoEmbeddable=true&safeSearch=strict`
        break
      default:
        console.log("Url doesn't match any known patterns")
    }

    return url
  }

  axiosFetcher = async (
    urlTypeParam: string,
    searchParam?: string,
    searchType?: string,
    songTitle?: string,
  ): Promise<any> => {
    return axios
      .get(this.urlSwitch(urlTypeParam, searchParam, searchType, songTitle))
      .catch((error) => console.log(error))
  }

  lastFmTrackFetcher = async (
    searchParam: string,
    searchType: string,
  ): Promise<Array<Song>> => {
    let results: any = Array<Song>()

    try {
      let response = await this.axiosFetcher('track', searchParam, searchType)
      let APIRESPONSETRACKLIST: Array<Song> = Array<Song>()

      if (searchType === 'artist') {
        APIRESPONSETRACKLIST = response.data.toptracks.track
      } else {
        APIRESPONSETRACKLIST = response.data.tracks.track
      }

      for (let i in APIRESPONSETRACKLIST) {
        results[i] = {
          name:
            APIRESPONSETRACKLIST[i].artist.name +
            ', ' +
            APIRESPONSETRACKLIST[i].name,
          artist: {
            name: APIRESPONSETRACKLIST[i].artist.name,
          },
          source: '',
        }
      }
    } catch (error) {
      console.log(error)
    }

    return results
  }

  fetchTracklist = async (
    searchParam: string,
    youtubeApiError: boolean,
    songTitle: string,
    source: string,
    searchType: string,
  ): Promise<Array<Song>> => {
    let tracks: Array<Song> = []

    if (youtubeApiError) {
      tracks = await this.fetchTracklistFromDatabase()
    } else if (searchParam && searchParam.length > 0) {
      tracks = await this.lastFmTrackFetcher(searchParam, searchType)
    } else if (songTitle && source) {
      // get similar tracks from api in case list runs out
      let artist_and_track = songTitle.split(',')
      let artist = artist_and_track[0]
      let track = artist_and_track[1]
      tracks = await this.lastFmTrackFetcher(artist, track)
    } else {
      return []
    }

    if (tracks.length <= 0) {
      //this.setMessageModal('No tracks found from LastFM API, try again', true)
      return []
    }

    return tracks
  }

  getSongFromOldDatabase = async (
    songTitle: string,
    searchParam: string,
  ): Promise<string> => {
    const db = firebase.firestore()

    // replace all slashes for querying, but do not save these versions to db
    let q_title = songTitle.replaceAll('/', ' ').replaceAll('\ ', ' ')
    let q_searchParam = searchParam.replaceAll('/', ' ').replaceAll('\ ', ' ')

    // raise and show error
    if (!!q_title === false || !!q_searchParam === false) return ''

    return await db
      .collection('good_songs')
      .doc(q_searchParam)
      .collection(q_title)
      .doc('details')
      .get()
      .then(function (doc) {
        if (doc.exists) {
          let data = doc.data()
          if (data) {
            return data.source
          }
          return ''
        } else {
          return doc.data()
        }
      })
      .catch(function (error) {})
  }

  fetchTracklistFromDatabase = async (): Promise<Array<Song>> => {
    const db = firebase.firestore()

    // iterate database and push track title and sources to results
    let searchType = ['artists', 'genre']
    let results: Array<Song> = []

    for (let type of searchType) {
      await db
        .collection(type)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let tracks = doc.data()

            for (let track in tracks) {
              results.push({
                name: track,
                artist: {
                  name: doc.id,
                },
                source: tracks[track].split('?')[0],
              })
            }
          })
        })
    }

    return Promise.resolve(results)
  }

  saveToDatabase = (
    songTitle: string,
    source: string,
    searchType: string,
    searchParam: string,
  ): Promise<FirestoreError> => {
    if (
      !!songTitle === false ||
      !!source === false ||
      !!searchParam === false ||
      !!searchType === false
    ) {
      return Promise.resolve({
        error: false,
        message: 'Missing parameter',
      })
    }
    const db = firebase.firestore()

    db.collection(searchType === 'artist' ? 'artists' : 'genre')
      .doc(searchParam)
      .set(
        {
          [songTitle]: source,
        },
        { merge: true },
      )
      .catch((error) => {
        console.error(error)
        return {
          message: `Error adding song ${songTitle} to database`,
          error: true,
        }
      })

    return Promise.resolve({ error: false, message: '' })
  }

  getSongFromYoutube = async (
    songTitle: string,
  ): Promise<YoutubeApiResponse> => {
    let YoutubeResponse: YoutubeApiResponse = {
      source: '',
      counter: 0,
      error: false,
      message: '',
      urls: [],
    }

    const youtubeVideos: any = []

    let res: any = await this.axiosFetcher('youtube', '', '', songTitle)

    if (res === undefined || res.error) {
      YoutubeResponse.error = true
      YoutubeResponse.message = 'YouTube api error'
      YoutubeResponse.counter = 0
      return YoutubeResponse
    }

    const youtube_result = res.data.items

    if (!!youtube_result === false || youtube_result.length === 0) {
      YoutubeResponse.error = true
      YoutubeResponse.message = songTitle + ' not found'
      YoutubeResponse.counter = 0
      return YoutubeResponse
    }

    let artist_and_track = songTitle.split(',')

    let artist_name = artist_and_track.shift()
    if (artist_name) {
      // tarvitaanko tätä...?
      artist_name.toLowerCase()
    }

    let track_title = artist_and_track
      .join(' ')
      .toLowerCase()
      .trim()
      .split(`'`)[0]

    for (let video_result of youtube_result) {
      let video_title = video_result.snippet.title.toLowerCase()

      if (filterYoutubeResponseTitle(video_title, track_title)) {
        youtubeVideos.push(YOUTUBE_URL_EMBED + video_result.id.videoId)
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

  searchBarAPI = async (
    searchParam: string,
    searchType: string,
  ): Promise<Array<LastFmApiResponse>> => {
    let lastFMResponse: Array<LastFmApiResponse> = new Array()
    try {
      let res

      if (searchType === 'artist') {
        res = await this.axiosFetcher('artist', searchParam)
        lastFMResponse = res.data.results.artistmatches.artist
        lastFMResponse = lastFMResponse.filter((a: LastFmApiResponse) =>
          a.name.toLowerCase().includes(searchParam.toLowerCase()),
        )
      } else {
        res = await this.axiosFetcher('tag', searchParam, searchType)
        lastFMResponse = res.data.toptags.tag

        lastFMResponse = lastFMResponse.filter((a: LastFmApiResponse) =>
          a.name.toLowerCase().includes(searchParam.toLowerCase()),
        )
      }
    } catch (error) {
      console.log(error)
    }

    return lastFMResponse
  }
}
