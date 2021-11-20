import React from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import StartComponent from './components/StartComponent';
import PlayerComponent from './components/PlayerComponent';
import AddSingersComponent from './components/AddSingersComponent';
import MessageComponent from './components/MessageComponent';
import { useSelector, useDispatch } from 'react-redux';
import './app.scss'

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
    const state = useSelector(state => state);
    const dispatch = useDispatch();

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  let youtubeVideos = [];

  const addSingerAmount = () => {
    let amount = state.singerAmount
    amount = amount + 1
    this.setState({
      singerAmount: amount
    })
  }

  const ReduceSingerAmount = () => {
    let amount = state.singerAmount
    amount = amount - 1
    if(amount <= 0){
      amount = 0
    }
    this.setState({
      singerAmount: amount
    })
  }

  const saveSingers = (singers) => {
      this.setState({
        singerQueue: singers
      })
  }

  const getSinger = ()  => {
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
      this.setState({ currentSinger: state.singerQueue[index], currentSingerIndex: index})
    }
    else {
      this.setState({ currentSinger: '', currentSingerIndex: 0})
    }
  }

  const getNewSingerAndSong = () => {
    getSinger();
    let timer = 10; // seconds
    let timeout = timer * 1000

    let message = `Nice job! `

    if(state.singerQueue.length > 1){
      message += `Next singer: ${state.currentSinger.name}`
    }

    this.setMessageModal(message, false, timer)
    setTimeout(() => {
      getSong();
      this.setState({
        modalVisible: false,
        message: {
          title: '',
          message: '',
          errorMessage: false,
          timer: 0,
        },
      })
    }, timeout);
  }
  
  const setMessageModal = (message, error=false, timer=0) => {
    if (message) {
      this.setState({
        modalVisible: true,
        message: {
          title: error ? 'Error' : '',
          message: message,
          error: error,
          timer: timer
        }
      })
    }
    else {
      this.setState({
        modalVisible: false
      })
    }
  }

  const removeTrack = (index) => {
    let results = state.trackList
    results.splice(index, 1)
    this.setState({
      trackList: results
    })
  }

  const fetchTracklist = (value=false) => {
    if(state.youtubeApiError){
      return fetchTracklistFromDatabase()
    }
    else if(state.title && state.source){
      let split = state.title.split(',')
      let artist = split[0]
      let track = split[1]
      return getSimilarTracksFromAPI(artist, track)
    }
    else {
      return fetchTracklistFromAPI(value)
    }
  }

  const fetchTracklistFromAPI = async (value) => {
    if (value === false && state.searchParam === '' || state.searchParam === ' ' || state.searchParam === null || state.searchParam === undefined) {
      this.setMessageModal('Empty input, try again', true)
      return;
    }

    let results = [];
    let search_value = value ? value : state.searchParam

    try {
      let res = await axios.get(`${LASTFM_URL}?method=${state.searchType}.gettoptracks&${state.searchType}=${search_value}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`);
      let response = ''

      if(state.searchType === 'artist'){
        response = res.data.toptracks.track
      }
      else {
        response = res.data.tracks.track
      }

      for (let i in response) {
        results[i] = response[i].artist.name + ', ' + response[i].name;
      }
    }
    catch (error) {
      console.log(error);
    }

    if (results.length > 0) {
      this.setState({
        trackList: results
      })
    }
    else {
      this.setState({
        trackList: []
      })
      this.setMessageModal('No tracks found from LastFM API, try again', true)
      return;
    }
  }

  const getSimilarTracksFromAPI = async (artist, track) => {
    let errors = [false, '', ' ', null, undefined]
    if (errors.includes(artist) || errors.includes(track)) {
      return;
    }

    let results = [];

    try {
      let res = await axios.get(`${LASTFM_URL}?method=track.getsimilar&artist=${artist}&track=${track}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`);
      let response = res.data.similartracks.track

      for (let i in response) {
        results[i] = response[i].artist.name + ', ' + response[i].name;
      }
    }
    catch (error) {
      console.log(error);
    }
    
    if (results.length > 0) {
      results = results.concat(state.trackList)
      this.setState({
        trackList: results
      })
    }
  }

  const fetchTracklistFromDatabase = async () => {
    // iterate database and push track title and sources to results
    let searchType = ['artists', 'genre']
    let results = []
    for(let type of searchType){
      await db.collection(type).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc =>{
            let tracks = doc.data()
            for(let track in tracks){
              results.push({[track]: tracks[track].split('?')[0]})
            }
        })
      })
    }
    if (results.length > 0) {
      this.setState({
        trackList: results
      })
    }
    else {
      this.setState({
        trackList: []
      })
      this.setMessageModal('No tracks found from database, try again', true)
      return;
    }
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
      getSinger()
    }

    this.setMessageModal(false)
    if(state.youtubeApiError && state.trackList.length > 0){
      return getSongFromTracklist()
    }
    else {
      return getSongFromDatabase()
    }
  }

  const getSongFromTracklist = async () => {
    let track = await state.trackList[Math.floor(Math.random() * state.trackList.length)]
    this.setState({
      title: Object.keys(track)[0],
      source: Object.values(track)[0]
    })
  }

  const getSongFromDatabase = async () => {

    youtubeVideos = [];
    this.setState({ updateCounter: '' });
    let title = ''
    if(state.trackList.length <= 0){
      title = state.searchParam
    }
    else {
      title = await state.trackList[Math.floor(Math.random() * state.trackList.length)]
    }

    // replace all slashes for querying, but do not save these versions to db
    let q_title = title.replaceAll('/', ' ').replaceAll('\ ', ' ')
    let q_searchParam = state.searchParam.replaceAll('/', ' ').replaceAll('\ ', ' ')
    
    let source = await db.collection('good_songs').doc(q_searchParam).collection(q_title).doc('details')
      .get()
      .then(function (doc) {
        if (doc.exists) {
          return doc.data().source;
        } else {
          return doc.data();
        }
      })
      .catch(function (error) {
      });

    if (source === undefined) {
      return getSongFromYoutube(title);
    }
    else {
      this.setState({
        title: title,
        source: source.split('?')[0]
      })
      saveToDatabase(title, state.source)
    }
  }

  const getSongFromYoutube = (title) => {
    let errors = state.errorCounter
    if (errors >= state.errorLimit) {
      this.setMessageModal('Too many errors, try something else', true)
      this.setState({
        youtubeApiError: true
      })
      return;
    }
    youtubeVideos = [];
        
    fetch(`${YOUTUBE_URL_REQUEST}?part=snippet&key=${process.env.REACT_APP_YOUTUBE_API_KEY}&q=karaoke+${title}&type=video&videoEmbeddable=true&safeSearch=strict`)
      .then(response => response.json())
      .then(res => {
        let i = 0;

        if (res.error) {
          console.log(res.error);
          errors++
          this.setMessageModal('Youtube api error', true)
          this.setState({
            youtubeApiError: true,
            trackList: [],
            errorCounter: errors,
          })
          return;
        }

        if (res.items === undefined || res.items === 'undefined' || res.items.length === 0) {
          errors++
          this.setMessageModal(title + ' not found')
          this.setState({
            errorCounter: errors,
          })
          return;
        }

        let test = title.split(',')
        let artist = test[0].toLowerCase()
        let track = test[1].toLowerCase().trim()

        for (i in res.items) {
          let string = res.items[i].snippet.title.toLowerCase()

          if(string.includes(artist) && string.includes(track) && string.includes('karaoke') && !string.includes('cover')){
              youtubeVideos.push(YOUTUBE_URL_EMBED + res.items[i].id.videoId);
            }
        }

        if(youtubeVideos.length === 0){
          let tracks = state.trackList
          tracks = tracks.filter(x => x !== title)
          this.setState({
            trackList: tracks,
          })
          this.setMessageModal(title + ' not found')
          return;
        }

        this.setState({
          title: title,
          source: youtubeVideos[0],
          updateCounter: youtubeVideos.length
        });

        saveToDatabase(title, youtubeVideos[0])
      })
      .catch(error => {
        console.log(error);
      });
  }

  const updateSong = () => {
    youtubeVideos.shift();

    if (youtubeVideos.length > 0) {
      this.setState({
        source: youtubeVideos[0],
        updateCounter: youtubeVideos.length
      });

      saveToDatabase(state.title, youtubeVideos[0])
    }
    else {
      getSongFromYoutube(state.title);
    }
  }

  const saveToDatabase = (title, source) => {
    db.collection(state.searchType === 'artist' ? 'artists' : 'genre').doc(state.searchParam).set({
      [title]: source
    }, {merge: true} )
    .catch(error => {
      console.error('Error adding document: ', error);
    });
    this.setState({
      errorCounter: 0
    })
  }

  const resetSong = () => {
    this.setState({
      title: '',
      source: '',
      searchParam: 'rock',
      currentSinger: '',
      updateCounter: '',
      trackList: [],
      errorCounter: 0
    })
    youtubeVideos = [];
  }
  
  return (
    <div className='main'>
      <Routes>
        <Route path='/' render={() => (
          <Navigate to='start' />
        )} />
        <Route path='/start' render={() => (
          <StartComponent
            searchType={state.searchType}
            searchParam={state.searchParam}
            fetchTracklist={fetchTracklist}
            removeTrack={removeTrack}
            getSong={getSong}
            singerQueue={state.singerQueue}
            youtubeApiError={state.youtubeApiError}
            trackList={state.trackList}
          />
        )} />
        <Route path='/add-singers' render={() => (
          <AddSingersComponent
            singerAmount={state.singerAmount}
            addSingerAmount={addSingerAmount}
            ReduceSingerAmount={ReduceSingerAmount}
            singerQueue={state.singerQueue}
            saveSingers={saveSingers}
          />
        )} />
        <Route path='/player' render={() => (
          <PlayerComponent
            title={state.title}
            currentSinger={state.currentSinger}
            source={state.source}
            resetSong={resetSong}
            getSong={getSong}
            updateSong={updateSong}
            updateCounter={state.updateCounter}
            getNewSingerAndSong={getNewSingerAndSong}
          />
        )} />
        {state.modalVisible
          ? <MessageComponent
            message={state.message}
            setMessageModal={setMessageModal}
            youtubeApiError={state.youtubeApiError}
            getSong={getSong}
          />
          : null
        }
        </Routes>
    </div>
  );
}

export default Home;