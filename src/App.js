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
      genre: '',
      type: 'tag',
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
      },
      errorLimit: 5,
      apiError: false,
      errorCounter: 0,
    }

    this.updateGenre = this.updateGenre.bind(this);
    /*
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    */
  }

  youtubeVideos = [];

  /*
  player;

  getYTPlayer(player) {
    if(this.state.player === undefined && player !== undefined){
      let pl = new window.YT.Player(player.h, {
        events: {
          onStateChange: this.onPlayerStateChange.bind(this),
          onError: this.onPlayerError.bind(this)
        },
      });
      this.setState({
        player: pl
      })
    }
  }

  onPlayerStateChange(event) {
    console.log('player event')
    console.log(event)
    if(event !== undefined){
      if(event.data === 0){
        this.getSong()
      }
    }
  }

  onPlayerError(event){
    console.log('player error')
    console.log(event)
    this.getSong()
  }
*/

  updateGenre(event) {
    let string = event.target ? event.target.value.toLowerCase().trim() : event

    this.setState({
      genre: string
    })

    if(string === ''){
      this.setState({
        trackList: []
      })
    }
  }

  updateType(event) {
    let string = event.target.value.toLowerCase()

    this.setState({
      type: string
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

  render() {
    return (
      <div className='main'>
        <BrowserRouter>
          <Route path='/' render={() => (
            <Redirect to='start' />
          )} />
          <Route path='/start' render={() => (
            <StartComponent
              updateType={this.updateType.bind(this)}
              type={this.state.type}
              genre={this.state.genre}
              updateGenre={this.updateGenre.bind(this)}
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
            />
          )} />
          {this.state.modalVisible
            ? <MessageComponent
              message={this.state.message}
              setErrorModal={this.setErrorModal.bind(this)}
              apiError={this.state.apiError}
              getSong={this.getSong.bind(this)}
            />
            : null
          }
        </BrowserRouter>
      </div>
    );
  }
  
  setErrorModal(message, error=false) {
    if (message) {
      this.setState({
        modalVisible: true,
        message: {
          title: 'Error',
          message: message,
          forceBackToStart: error
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
    if (value === false && this.state.genre === '' || this.state.genre === ' ' || this.state.genre === null || this.state.genre === undefined) {
      this.setErrorModal('Empty input, try again', true)
      return;
    }

    let tracklist = [];
    let search_value = value ? value : this.state.genre

    try {
      let res = await axios.get(`${LASTFM_URL}?method=${this.state.type}.gettoptracks&${this.state.type}=${search_value}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`);
      let response = ''

      if(this.state.type === 'artist'){
        response = res.data.toptracks.track
      }
      else {
        response = res.data.tracks.track
      }

      for (let i in response) {
        tracklist[i] = response[i].artist.name + ', ' + response[i].name;
      }
    }
    catch (error) {
      console.log(error);
    }

    if (tracklist.length > 0) {
      this.setErrorModal(false)
      this.setState({
        trackList: tracklist
      })
    }
    else {
      this.setState({
        trackList: []
      })
      this.setErrorModal('No tracks found from LastFM API, try again', true)
      return;
    }
  }

  fetchTracklistFromDatabase = async () => {
    let type = ['artists', 'genres']
    let tracklist = []
    for(let a of type){
      await db.collection(a).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc =>{
            let tracks = doc.data()
            for(let a in tracks){
              tracklist.push({[a]: tracks[a].split('?')[0]})
            }
        })
      })
    }
    if (tracklist.length > 0) {
      this.setErrorModal(false)
      this.setState({
        trackList: tracklist
      })
    }
    else {
      this.setState({
        trackList: []
      })
      this.setErrorModal('No tracks found from database, try again', true)
      return;
    }
  }

  getSong = () => {
    if(this.state.apiError === false){
      if(this.state.genre === '' || this.state.genre === ' ' || this.state.genre === null || this.state.genre === undefined) {
        this.setErrorModal('Empty input, try again', true)
        return;
      }
    }
    if(this.state.trackList.length <= 1){
      this.fetchTracklist()
    }
    else {
      this.setErrorModal('Tracklist empty !', true)
    }
    if(this.state.modalVisible === false){
      this.getSinger()
    }
    this.setErrorModal(false)
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
      title = this.state.genre
    }
    else {
      title = await this.state.trackList[Math.floor(Math.random() * this.state.trackList.length)]
    }

    // replace all slashes for querying, but do not save these versions to db
    let q_title = title.replaceAll('/', ' ').replaceAll('\ ', ' ')
    let q_genre = this.state.genre.replaceAll('/', ' ').replaceAll('\ ', ' ')
    
    let source = await db.collection('good_songs').doc(q_genre).collection(q_title).doc('details')
      .get()
      .then(function (doc) {
        if (doc.exists) {
          console.log(doc.data().source)
          return doc.data().source;
        } else {
          return doc.data();
        }
      })
      .catch(function (error) {
        console.log('Error getting document:', error);
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
      this.setErrorModal('Too many errors, try something else', true)
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
          this.setErrorModal('Youtube api error', true)
          this.setState({
            apiError: true,
            trackList: [],
            errorCounter: errors,
          })
          return;
        }

        if (res.items === undefined || res.items === 'undefined' || res.items.length === 0) {
          errors++
          this.setErrorModal(title + ' not found')
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
          this.setErrorModal(title + ' not found')
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
      
      console.log(this.youtubeVideos)

      this.saveToDatabase(this.state.title, this.youtubeVideos[0])
    }
    else {
      this.getSongFromYoutube(this.state.title);
    }
  }

  saveToDatabase = (title, source) => {
    console.log(`save to database ${title} ${source}`)
    db.collection(this.state.type === 'artist' ? 'artists' : 'genres').doc(this.state.genre).set({
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
      genre: 'rock',
      currentSinger: '',
      updateCounter: '',
      trackList: [],
      errorCounter: 0
    })
    this.youtubeVideos = [];
  }
}

export default App;