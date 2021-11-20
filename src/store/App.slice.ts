import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export interface Track {
    title: string;
}
export interface Singer {
    name: string;
}

export interface Artist {
  name: string;
}

export interface Song {
  name: string;
  artist: Artist;
  source: string;
}

export interface Message {
    title: string;
    message: string;
    errorMessage: boolean;
    timer: number;
    errorLimit: number;
    youtubeApiError: boolean;
    errorCounter: number;
}
export interface AppState {
    value: number;
    title: string;
    source: string;
    searchParam: string;
    searchType: string;
    trackList: Array<Track>;
    singerAmount: number;
    singerQueue: Array<Singer>;
    currentSinger: string;
    currentSingerIndex: number;
    updateCounter: number;
    modalVisible: boolean;
    message: Message;
}

const initialState: AppState = {
    value: 0,
    title: '',
    source: '',
    searchParam: '',
    searchType: 'tag',
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

export const stateSlice: any = createSlice({
  name: 'data',
  initialState,
  reducers: {
    updateSearchParam: (state, action: PayloadAction<string>) => {
      state.searchParam = action.payload
    },
    updateSearchType: (state, action: PayloadAction<string>) => {
      state.searchType = action.payload;
    },
    updateTrackList: (state, action: PayloadAction<Array<Track>>) => {
      state.trackList = [...action.payload]
    },
    updateCounter: (state, action: PayloadAction<number>) => {
      state.updateCounter = action.payload;
    },
    updateSource: (state, action: PayloadAction<string>) => {
      state.source = action.payload;
    },
    updateTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount, updateSearchParam, updateSearchType, updateTrackList, updateCounter, updateSource, updateTitle } = stateSlice.actions

export default stateSlice.reducer