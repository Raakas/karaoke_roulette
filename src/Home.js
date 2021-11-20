import React, { useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Switch } from 'react-router-dom';
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import StartComponent from './components/StartComponent';
import PlayerComponent from './components/PlayerComponent';
import AddSingersComponent from './components/AddSingersComponent';
import MessageComponent from './components/MessageComponent';
import { useSelector, useDispatch } from 'react-redux';
import './app.scss'
import {ApiFetchService} from './services/fetchService';
import { updateTrackList, Track } from './store/App.slice'

const apiFetchService = new ApiFetchService()

// const dispatch = useDispatch();
//  const count = useSelector((state: RootState) => state.counter.value)
// TAI
// const state = useSelector((state: RootState) => state);
//dispatch

require('dotenv').config();

const YOUTUBE_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_URL_EMBED = 'https://www.youtube.com/embed/';
const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
})

const db = firebase.firestore();

const Home = () => {
    const state = useSelector(state => state.data);
    const dispatch = useDispatch();

  const fetchTracklist = async () => {
    console.log(' fetch track list')
    console.log(state)
    let tracks = []
    
    if(state.searchParam === ''){
      console.log('Empty input, try again')
      //this.setMessageModal('Empty input, try again', true)
      return;
    }

    if(state.youtubeApiError){
      //tracks = fetchTracklistFromDatabase()
    }
    else if(state.title && state.source){
      let split = state.title.split(',')
      let artist = split[0]
      let track = split[1]
      //tracks =  getSimilarTracksFromAPI(artist, track)
    }
    else {
      tracks = await apiFetchService.fetchTracklistFromAPI(state.searchParam, state.searchType).then(result => result);
    }
    console.log('home ', tracks)

    if(tracks.length <= 0){
      console.log('No tracks found from LastFM API, try again')
      //this.setMessageModal('No tracks found from LastFM API, try again', true)
      return;
    }

    dispatch({
      type: updateTrackList, payload: tracks
    })

  }
  
  const removeTrack = (index) => {
    let results = state.trackList
    results.splice(index, 1)
    this.setState({
      trackList: results
    })
  }

  const getSong = () => {
    if(state.youtubeApiError === false){
      if(state.searchParam === '' || state.searchParam === ' ' || state.searchParam === null || state.searchParam === undefined) {
        return this.setMessageModal('Empty input, try again', true);
      }
    }

    if(state.trackList.length <= 1){
      this.fetchTracklist()
    }

    if(state.modalVisible === false){
      //getSinger()
    }

    this.setMessageModal(false)
    if(state.youtubeApiError && state.trackList.length > 0){
      //return getSongFromTracklist()
    }
    else {
      //return getSongFromDatabase()
    }
  }

  return (
    <div className='main'>
      <Routes>
        <Route path='/' element={
          <StartComponent
            fetchTracklist={fetchTracklist}
            removeTrack={removeTrack}
            getSong={getSong}
        />
        }>
        </Route>
      </Routes>
    </div>
  );
}

export default Home;