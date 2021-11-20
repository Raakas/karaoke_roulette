import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export interface Track {
    title: string,
    source: string
}
export interface Singer {
    name: string
}

export interface Message {
    title: string,
    message: string,
    errorMessage: boolean,
    timer: number,
    errorLimit: number,
    youtubeApiError: boolean,
    errorCounter: number,
}
export interface AppState {
  value: number,
    title: string,
    source: string,
    searchParam: string,
    searchType?: string,
    trackList: Array<Track>,
    singerAmount: number,
    singerQueue: Array<Singer>,
    currentSinger: string,
    currentSingerIndex: number,
    updateCounter: number,
    modalVisible: boolean,
    message: Message
}

const initialState: AppState = {
  value: 0,
  title: '',
  source: '',
    searchParam: '',
    searchType: '',
    trackList: [],
    singerAmount: 3,
    singerQueue: [],
    currentSinger: '',
    currentSingerIndex: 0,
    updateCounter: 0,
    modalVisible: false,
    message: {
    title: '',
    message: '',
    errorMessage: false,
    timer: 0,
    errorLimit: 0,
    youtubeApiError: false,
    errorCounter: 0,
    }

}

export const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount } = stateSlice.actions

export default stateSlice.reducer