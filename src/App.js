import React from 'react';
import axios from 'axios';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import firebase from 'firebase/app'
import 'firebase/firestore'
import StartComponent from './components/StartComponent';
import PlayerComponent from './components/PlayerComponent';
import AddSingersComponent from './components/AddSingersComponent';
import MessageComponent from './components/MessageComponent';
import './app.scss'

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

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      source: '',
      searchParam: '',
      searchType: 'tag',
      trackList: [],
      singerAmount: 3,
      queue: [],
      currentSinger: '',
      index: 0,
      updateCounter: '',
      modalVisible: false,
      message: {
        title: '',
        message: '',
        errorMessage: false,
        timer: 0,
      },
      errorLimit: 5,
      apiError: false,
      errorCounter: 0,
    }

    this.updateSearchParam = this.updateSearchParam.bind(this);

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  }

  youtubeVideos = [];

  updateSearchParam(event) {
    if(event === undefined || event === ''){
      return;
    }

    let string = event.target ? event.target.value.toLowerCase().trim() : event

    this.setState({
      searchParam: string
    })

    if(string === ''){
      this.setState({
        trackList: []
      })
    }
  }

  updateSearchTypo(event) {
    let string = event.target.value.toLowerCase()

    this.setState({
      searchType: string
    })
  }

  addSingerAmount = () => {
    let amount = this.state.singerAmount
    amount = amount + 1
    this.setState({
      singerAmount: amount
    })
  }

  ReduceSingerAmount = () => {
    let amount = this.state.singerAmount
    amount = amount - 1
    if(amount <= 0){
      amount = 0
    }
    this.setState({
      singerAmount: amount
    })
  }

  saveSingers = (singers) => {
      this.setState({
        queue: singers
      })
  }

  getSinger = ()  => {
    if (this.state.queue.length > 0){
      let index = this.state.index
      if (this.state.currentSinger === ''){
        index = Math.floor(Math.random() * this.state.queue.length)
      }
      else {
        index = index + 1
        if (index > this.state.queue.length - 1){
          index = 0
        }
      }
      this.setState({ currentSinger: this.state.queue[index], index: index})
    }
    else {
      this.setState({ currentSinger: '', index: 0})
    }
  }

  getNewSingerAndSong = () => {
    this.getSinger();
    let timer = 10; // seconds
    let timeout = timer * 1000

    let message = `Nice job! `

    if(this.state.queue.length > 1){
      message += `Next singer: ${this.state.currentSinger.name}`
    }

    this.setMessageModal(message, false, timer)
    setTimeout(() => {
      this.getSong();
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

  render() {
    return (
      <div className='main'>
        <BrowserRouter>
          <Route path='/' render={() => (
            <Redirect to='start' />
          )} />
          <Route path='/start' render={() => (
            <StartComponent
              updateSearchTypo={this.updateSearchTypo.bind(this)}
              searchType={this.state.searchType}
              searchParam={this.state.searchParam}
              updateSearchParam={this.updateSearchParam.bind(this)}
              fetchTracklist={this.fetchTracklist.bind(this)}
              getSong={this.getSong.bind(this)}
              queue={this.state.queue}
              apiError={this.state.apiError}
              trackList={this.state.trackList}
            />
          )} />
          <Route path='/add-singers' render={() => (
            <AddSingersComponent
              singerAmount={this.state.singerAmount}
              addSingerAmount={this.addSingerAmount.bind(this)}
              ReduceSingerAmount={this.ReduceSingerAmount.bind(this)}
              queue={this.state.queue}
              saveSingers={this.saveSingers.bind(this)}
            />
          )} />
          <Route path='/player' render={() => (
            <PlayerComponent
              title={this.state.title}
              currentSinger={this.state.currentSinger}
              source={this.state.source}
              resetSong={this.resetSong.bind(this)}
              getSong={this.getSong.bind(this)}
              updateSong={this.updateSong.bind(this)}
              updateCounter={this.state.updateCounter}
              getNewSingerAndSong={this.getNewSingerAndSong.bind(this)}
              getSimilarTracksFromAPI={this.getSimilarTracksFromAPI.bind(this)}
            />
          )} />
          {this.state.modalVisible
            ? <MessageComponent
              message={this.state.message}
              setMessageModal={this.setMessageModal.bind(this)}
              apiError={this.state.apiError}
              getSong={this.getSong.bind(this)}
            />
            : null
          }
        </BrowserRouter>
      </div>
    );
  }
  
  setMessageModal(message, error=false, timer=0) {
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

  fetchTracklist = (value=false) => {
    if(this.state.apiError){
      return this.fetchTracklistFromDatabase()
    }
    else {
      return this.fetchTracklistFromAPI(value)
    }
  }

  fetchTracklistFromAPI = async (value) => {
    if (value === false && this.state.searchParam === '' || this.state.searchParam === ' ' || this.state.searchParam === null || this.state.searchParam === undefined) {
      this.setMessageModal('Empty input, try again', true)
      return;
    }

    let results = [];
    let search_value = value ? value : this.state.searchParam

    try {
      let res = await axios.get(`${LASTFM_URL}?method=${this.state.searchType}.gettoptracks&${this.state.searchType}=${search_value}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`);
      let response = ''

      if(this.state.searchType === 'artist'){
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

  getSimilarTracksFromAPI = async (artist, track) => {
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
      results = results.concat(this.state.trackList)
      this.setState({
        trackList: results
      })
    }
  }

  fetchTracklistFromDatabase = async () => {
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

  getSong = () => {
    if(this.state.apiError === false){
      if(this.state.searchParam === '' || this.state.searchParam === ' ' || this.state.searchParam === null || this.state.searchParam === undefined) {
        return this.setMessageModal('Empty input, try again', true);
      }
    }

    if(this.state.trackList.length <= 1){
      this.fetchTracklist()
    }

    if(this.state.modalVisible === false){
      this.getSinger()
    }

    this.setMessageModal(false)
    if(this.state.apiError && this.state.trackList.length > 0){
      return this.getSongFromTracklist()
    }
    else {
      return this.getSongFromDatabase()
    }
  }

  getSongFromTracklist = async () => {
    let track = await this.state.trackList[Math.floor(Math.random() * this.state.trackList.length)]
    this.setState({
      title: Object.keys(track)[0],
      source: Object.values(track)[0]
    })
  }

  getSongFromDatabase = async () => {

    this.youtubeVideos = [];
    this.setState({ updateCounter: '' });
    let title = ''
    if(this.state.trackList.length <= 0){
      title = this.state.searchParam
    }
    else {
      title = await this.state.trackList[Math.floor(Math.random() * this.state.trackList.length)]
    }

    // replace all slashes for querying, but do not save these versions to db
    let q_title = title.replaceAll('/', ' ').replaceAll('\ ', ' ')
    let q_searchParam = this.state.searchParam.replaceAll('/', ' ').replaceAll('\ ', ' ')
    
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
      return this.getSongFromYoutube(title);
    }
    else {
      this.setState({
        title: title,
        source: source.split('?')[0]
      })
      this.saveToDatabase(title, this.state.source)
    }
  }

  getSongFromYoutube = (title) => {
    let errors = this.state.errorCounter
    if (errors >= this.state.errorLimit) {
      this.setMessageModal('Too many errors, try something else', true)
      this.setState({
        apiError: true
      })
      return;
    }
    this.youtubeVideos = [];
        
    fetch(`${YOUTUBE_URL_REQUEST}?part=snippet&key=${process.env.REACT_APP_YOUTUBE_API_KEY}&q=karaoke+${title}&type=video&videoEmbeddable=true&safeSearch=strict`)
      .then(response => response.json())
      .then(res => {
        let i = 0;

        if (res.error) {
          console.log(res.error);
          errors++
          this.setMessageModal('Youtube api error', true)
          this.setState({
            apiError: true,
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
              this.youtubeVideos.push(YOUTUBE_URL_EMBED + res.items[i].id.videoId);
            }
        }

        if(this.youtubeVideos.length === 0){
          let tracks = this.state.trackList
          tracks = tracks.filter(x => x !== title)
          this.setState({
            trackList: tracks,
          })
          this.setMessageModal(title + ' not found')
          return;
        }

        this.setState({
          title: title,
          source: this.youtubeVideos[0],
          updateCounter: this.youtubeVideos.length
        });

        this.saveToDatabase(title, this.youtubeVideos[0])
      })
      .catch(error => {
        console.log(error);
      });
  }

  updateSong = () => {
    this.youtubeVideos.shift();

    if (this.youtubeVideos.length > 0) {
      this.setState({
        source: this.youtubeVideos[0],
        updateCounter: this.youtubeVideos.length
      });

      this.saveToDatabase(this.state.title, this.youtubeVideos[0])
    }
    else {
      this.getSongFromYoutube(this.state.title);
    }
  }

  saveToDatabase = (title, source) => {
    db.collection(this.state.searchType === 'artist' ? 'artists' : 'genre').doc(this.state.searchParam).set({
      [title]: source
    }, {merge: true} )
    .catch(error => {
      console.error('Error adding document: ', error);
    });
    this.setState({
      errorCounter: 0
    })
  }

  resetSong = () => {
    this.setState({
      title: '',
      source: '',
      searchParam: 'rock',
      currentSinger: '',
      updateCounter: '',
      trackList: [],
      errorCounter: 0
    })
    this.youtubeVideos = [];
  }
}

export default App;