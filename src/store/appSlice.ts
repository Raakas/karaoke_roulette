import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

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

export enum SearchChoices {
  ARTIST = 'artist',
  GENRE = 'tag',
}

export type SearchType = SearchChoices.ARTIST | SearchChoices.GENRE

export interface Artist {
  name: string
}

interface SongBase {
  name: string
  source: string
}

export interface Song extends SongBase {
  artist: Artist
}

export interface Message {
  title: string
  message: string
  isErrorMessage: boolean
  timer: number
}

export interface AppState {
  currentSong: SongBase
  searchParam: string
  searchType: SearchType
  trackList: Array<Song>
  youtubeSourceUrls: Array<string>
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
  timebeforeNextSong: number
  videoPlayerSaveToDatabaseTimer: number
}


const initialState: AppState = {
  currentSong: {
    name: '',
    source: '',
  },
  searchParam: '',
  searchType: SearchChoices.GENRE,
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
  message: {
    title: '',
    message: '',
    isErrorMessage: false,
    timer: 0,
  },
  // TODO: create settings page for these
  errorLimit: 3,
  timebeforeNextSong: 10,
  videoPlayerSaveToDatabaseTimer: 30,
}

export const stateSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    updateSearchParam: (state: AppState, action: PayloadAction<string>) => {
      state.searchParam = action.payload
    },
    updateSearchType: (state: AppState, action: PayloadAction<SearchType>) => {
      return { ...state, searchType: action.payload }
    },
    updateTrackList: (state: AppState, action: PayloadAction<Array<Song>>) => {
      if (action.payload) state.trackList = action.payload
    },
    updateCurrentSong: (state: AppState, action: PayloadAction<SongBase>) => {
      state.currentSong = action.payload
    },
    getNewSinger: (state: AppState) => {
      if (state.singerQueue.length > 0) {
        let index = state.currentSingerIndex

        if (state.currentSinger === '') {
          index = Math.floor(Math.random() * state.singerQueue.length)
        } else {
          index = index + 1
          if (index > state.singerQueue.length - 1) {
            index = 0
          }
        }

        let nextIndex = index + 1
        if (nextIndex > state.singerQueue.length - 1) {
          nextIndex = 0
        }

        state.currentSinger = state.singerQueue[index].name
        state.nextSinger = state.singerQueue[nextIndex].name
        state.currentSingerIndex = index
      } else {
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
    resetSongAndTracklist: (state) => ({
      ...state,
      currentSong: {
        name: '',
        source: '',
      },
      currentSinger: '',
      currentSingerIndex: 0,
      YoutubeVideoCounter: 0,
      errorCounter: 0,
      message: {
        title: '',
        message: '',
        isErrorMessage: false,
        timer: 0,
      },
    }),
    updateYoutubeVideoCounter: (
      state: AppState,
      action: PayloadAction<number>,
    ) => {
      state.YoutubeVideoCounter = action.payload
    },
    setYoutubeUlrs: (state: AppState, action: PayloadAction<Array<string>>) => {
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
  },
})

// Action creators are generated for each case reducer function
export const {
  updateSearchParam,
  updateSearchType,
  updateTrackList,
  updateYoutubeVideoCounter,
  setYoutubeUlrs,
  updateCurrentSong,
  getNewSinger,
  updateSetMessage,
  updateSingers,
  clearSingers,
  updateSingerAmount,
  resetSongAndTracklist,
  increaseErrorCount,
  resetErrorCounter,
  setYoutubeApiError,
} = stateSlice.actions

export default stateSlice.reducer

export const selectData = (state: RootState) => state.data

export const selectCurrentSong = (state: RootState) =>
  selectData(state).currentSong
export const selectTitle = (state: RootState) => selectCurrentSong(state).name
export const selectSource = (state: RootState) =>
  selectCurrentSong(state).source
export const selectSearchParam = (state: RootState) =>
  selectData(state).searchParam
export const selectSearchType = (state: RootState) =>
  selectData(state).searchType
export const selectTrackList = (state: RootState) => selectData(state).trackList
export const selectYoutubeSourceUrls = (state: RootState) =>
  selectData(state).youtubeSourceUrls
export const selectSingerAmount = (state: RootState) =>
  selectData(state).singerAmount
export const selectSingerQueue = (state: RootState) =>
  selectData(state).singerQueue
export const selectCurrentSinger = (state: RootState) =>
  selectData(state).currentSinger
export const selectCurrentSingerIndex = (state: RootState) =>
  selectData(state).currentSingerIndex
export const selectNextSinger = (state: RootState) =>
  selectData(state).nextSinger
export const selectYoutubeVideoCounter = (state: RootState) =>
  selectData(state).YoutubeVideoCounter

export const selectMessage = (state: RootState) => selectData(state).message
export const selectTimer = (state: RootState) => selectMessage(state).timer

export const selectYoutubeApiError = (state: RootState) =>
  selectData(state).youtubeApiError
export const selectErrorCounter = (state: RootState) =>
  selectData(state).errorCounter
export const selectErrorLimit = (state: RootState) =>
  selectData(state).errorLimit
export const selectTimebeforeNextSong = (state: RootState) =>
  selectData(state).timebeforeNextSong
export const selectVideoPlayerSaveToDatabaseTimer = (state: RootState) =>
  selectData(state).videoPlayerSaveToDatabaseTimer
