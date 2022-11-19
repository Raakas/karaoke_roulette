import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type CurrentSinger = {
  currentSinger: string
  currentSingerIndex: number
}

export interface LastFmApiResponse {
  name: string
  count: number
  reach: number
}

export interface FirestoreError {
  error: boolean
  message: string
}

export interface YoutubeApiResponse {
  source: string
  counter: number
  error: boolean
  message: string
  urls: Array<string>
}

export type Track = {
  name: string
}
export interface Singer {
  name: string
  id: number
  saved: boolean
}

export interface Artist {
  name: string
}

export interface Song {
  name: string
  artist: Artist
  source: string
}

export interface Message {
  title: string
  message: string
  isErrorMessage: boolean
  timer: number
}
export interface AppState {
  title: string
  source: string
  searchParam: string
  searchType: string
  trackList: Array<Song>
  youtubeSourceUrls: Array<string>,
  singerAmount: number
  singerQueue: Array<Singer>
  currentSinger: string
  currentSingerIndex: number
  nextSinger: string
  YoutubeVideoCounter: number
  message: Message
  youtubeApiError: boolean
  errorCounter: number
  errorLimit: number
}

const initialState = {
  title: '',
  source: '',
  searchParam: '',
  searchType: 'tag',
  trackList: [],
  youtubeSourceUrls: [],
  singerAmount: 3,
  singerQueue: [],
  currentSinger: '',
  currentSingerIndex: 0,
  nextSinger: '',
  YoutubeVideoCounter: 0,
  youtubeApiError: false,
  errorCounter: 0,
  errorLimit: 3,
  message: {
    title: '',
    message: '',
    isErrorMessage: false,
    timer: 0,
  }
} as AppState

export const stateSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    updateSearchParam: (state: AppState, action: PayloadAction<string>) => {
      state.searchParam = action.payload
    },
    updateSearchType: (state: AppState, action: PayloadAction<string>) => {
      return { ...state, searchType: action.payload }
    },
    updateTrackList: (state: AppState, action: PayloadAction<Array<Song>>) => {
      if (action.payload) state.trackList = action.payload
    },
    updateSource: (state: AppState, action: PayloadAction<string>) => {
      state.source = action.payload
    },
    updateTitle: (state: AppState, action: PayloadAction<string>) => {
      state.title = action.payload
    },
    getNewSinger: (state: AppState) => {
      if (state.singerQueue.length > 0){
        let index = state.currentSingerIndex

        if (state.currentSinger === ''){
          index = Math.floor(Math.random() * state.singerQueue.length)
        }
        else {
          index = index + 1
          if (index > state.singerQueue.length - 1){
            index = 0
          }
          
        }

        let nextIndex = index + 1
        if(nextIndex > state.singerQueue.length - 1){
          nextIndex = 0
        }

        state.currentSinger = state.singerQueue[index].name
        state.nextSinger = state.singerQueue[nextIndex].name
        state.currentSingerIndex = index
      }
      else {
        state.currentSinger = ''
        state.currentSingerIndex = 0
      }
    },
    updateSingers: (state: AppState, action: PayloadAction<Array<Singer>>) => {
      state.singerQueue = [...action.payload]
    },
    updateSingerAmount: (state: AppState, action: PayloadAction<number>) => {
      state.singerAmount = action.payload
    },
    clearSingers: (state: AppState, action: PayloadAction<boolean>) => {
      if (action.payload) state.singerQueue = []
    },
    updateSetMessage: (state: AppState, action: PayloadAction<Message>) => {
      state.message = { ...action.payload }
    },
    resetSongAndTracklist: (state: AppState, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state = {
          ...state,
          title: '',
          source: '',
          searchParam: 'rock',
          currentSinger: '',
          currentSingerIndex: 0,
          YoutubeVideoCounter: 0,
          trackList: [],
          errorCounter: 0
        }
        state.message = {
            title: '',
            message: '',
            isErrorMessage: false,
            timer: 0,
        }
      }
    },
    updateYoutubeVideoCounter: (state: AppState, action: PayloadAction<number>) => {
      state.YoutubeVideoCounter = action.payload
    },
    setYoutubeUlrs: (state: AppState, action: PayloadAction<Array<string>>)=>{
      state.youtubeSourceUrls = action.payload
    },
    setYoutubeApiError: (state: AppState, action: PayloadAction<boolean>) => {
      state.youtubeApiError = action.payload
    },
    increaseErrorCount: (state: AppState) => {
      state.errorCounter = state.errorCounter + 1
    },
    resetErrorCounter: (state: AppState) => {
      state.errorCounter = 0
    },
  }
})

// Action creators are generated for each case reducer function
export const {
  updateSearchParam,
  updateSearchType,
  updateTrackList,
  updateYoutubeVideoCounter,
  setYoutubeUlrs,
  updateSource,
  updateTitle,
  getNewSinger,
  updateSetMessage,
  updateSingers,
  clearSingers,
  updateSingerAmount,
  resetSongAndTracklist,
  increaseErrorCount,
  resetErrorCounter,
  setYoutubeApiError
} = stateSlice.actions

export default stateSlice.reducer