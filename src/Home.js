import React, { useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import StartComponent from './components/StartComponent';
import PlayerComponent from './components/PlayerComponent';
import AddSingersComponent from './components/AddSingersComponent';
import MessageComponent from './components/MessageComponent';
import { useSelector, useDispatch } from 'react-redux';
import './app.scss'
import {ApiFetchService} from './services/fetchService';
import { updateTrackList, updateCounter, updateSource, updateTitle } from './store/App.slice';

const apiFetchService = new ApiFetchService()

// const dispatch = useDispatch();
//  const count = useSelector((state: RootState) => state.counter.value)
// TAI
// const state = useSelector((state: RootState) => state);
//dispatch

require('dotenv').config();

const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/';

const Home = () => {
    const state = useSelector(state => state.data);
    const trackList = useSelector(state => state.data.trackList);
    const dispatch = useDispatch();

  const fetchTracklist = async () => {
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

    if(tracks.length <= 0){
      console.log('No tracks found from LastFM API, try again')
      //this.setMessageModal('No tracks found from LastFM API, try again', true)
      return;
    }

    dispatch({
      type: updateTrackList, payload: tracks
    })
    return tracks
  }

  const getSong = async () => {
    let source = ''
    let counter = 0
    if(state.youtubeApiError === false){
      if(state.searchParam === '' || state.searchParam === ' ' || state.searchParam === null || state.searchParam === undefined) {
        //return this.setMessageModal('Empty input, try again', true);
      }
    }

    let title = ''

    if(trackList.length <= 1){
      const refetch = await fetchTracklist()
      if(refetch.length != 0){
        let index = Math.floor(Math.random() * refetch.length)
        title = refetch[index]
      }
    }
    else {
      let index = Math.floor(Math.random() * trackList.length)
      title = trackList[index]
    }

    if(state.modalVisible === false){
      //getSinger()
    }

    //this.setMessageModal(false)
    if(state.youtubeApiError && trackList.length > 0){
      //return getSongFromTracklist()
    }
    else {
      dispatch({ type: updateCounter, payload: 0 });
      source = await apiFetchService.getSongFromDatabase(title, state.searchParam)
    }

    if (source === undefined) {
      let YoutubeResponse = await apiFetchService.getSongFromYoutube(title, state.trackList);
      console.log('youtube response ', YoutubeResponse)
      source = YoutubeResponse.source
      dispatch({
        type: updateCounter, payload: YoutubeResponse.counter
      })
    }
    console.log('source ', source)
    if(source === ''){
      let tracks = trackList
      tracks = tracks.filter(x => x.title !== title)
      dispatch({
        type: updateTrackList, payload: tracks,
      })
      //this.setMessageModal(title + ' not found')
      return;
    }

    dispatch({
      type: updateSource, payload: source.split('?')[0]
    })
    dispatch({
      type: updateTitle, payload: title
    })
    //saveToDatabase(title, state.source)
  }

  return (
    <div className='main'>
      <Routes>
        <Route path='/' element={
          <StartComponent
            fetchTracklist={fetchTracklist}
            getSong={getSong}
          />
        } />
        <Route path='/player' element={
          <PlayerComponent 
            getSong={getSong}
          />
        }/>

      </Routes>
    </div>
  );
}

export default Home;