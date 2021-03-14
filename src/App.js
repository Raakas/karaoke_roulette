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
      genre: 'rock',
      type: 'tag',
      queue: [],
      currentSinger: '',
      index: 0,
      updateCounter: '',
      modalVisible: false,
      message: {
        title: '',
        message: ''
      },
      errorLimit: 2,
      apiError: false,
    }

    this.updateGenre = this.updateGenre.bind(this);
  }

  tracklist = [];
  youtubeVideos = [];
  singers = [];
  errorCounter = 0;


  updateGenre(event) {
    let string = event.target.value.toLowerCase()

    this.setState({
      genre: string
    })
  }

  updateType(event) {    
    let string = event.target.value.toLowerCase()
    if(string === 'artist'){
      this.setState({
        genre: 'Elvis'
      })
    }

    this.setState({
      type: string
    })
  }

  addSinger = (event) => {
    let id = parseInt(event.target.id)
    let queue = this.state.queue

    let match = queue.find(a => a.id === id)

    if(match !== undefined){
      queue = queue.filter(a => a !== match)
    }
    
    let string = event.target.value
    string = string.trim()
    if(string !== ''){
      let singer = {
          id: parseInt(event.target.id),
          name: string
      }
      queue.push(singer)
      this.singers = queue
    }
  }

  saveSingers = () => {
      this.setState({
        queue: this.singers
      })
  }

  removeSinger = (event) => {
    let id = parseInt(event.target.id)
    let queue = this.state.queue
    queue = queue.filter(a => a.id !== id)
    this.setState({
      queue: queue
    })
    this.singers = queue
  }

  resetSingers = () => {
    this.singers = []
    this.setState({ queue: [] })
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
              updateGenre={this.updateGenre.bind(this)}
              fetchTracklist={this.fetchTracklist.bind(this)}
              queue={this.state.queue}
              apiError={this.state.apiError}
            />
          )} />
          <Route path='/add-singers' render={() => (
            <AddSingersComponent
              queue={this.state.queue}
              addSinger={this.addSinger.bind(this)}
              saveSingers={this.saveSingers.bind(this)}
              removeSinger={this.removeSinger.bind(this)}
              resetSingers={this.resetSingers.bind(this)}
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
            />
            : null
          }
        </BrowserRouter>
      </div>
    );
  }
  
  setErrorModal(message) {
    if (message) {
      this.setState({
        modalVisible: true,
        message: {
          title: 'Error',
          message: message
        }
      })
    }
    else {
      this.setState({
        modalVisible: false
      })
    }
  }

  fetchTracklist = () => {
    if(this.state.apiError){
      return this.fetchTracklistFromDatabase()
    }
    else {
      return this.fetchTracklistFromAPI()
    }
  }

  fetchTracklistFromAPI = async () => {
    console.log('fetch tracklist from api')
    if (this.state.genre === '' || this.state.genre === ' ' || this.state.genre === null || this.state.genre === undefined) {
      this.setErrorModal('Empty input, try again')
      return;
    }

    try {
      let res = await axios.get(`${LASTFM_URL}?method=${this.state.type}.gettoptracks&${this.state.type}=${this.state.genre}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`);
      let response = ''

      if(this.state.type === 'artist'){
        response = res.data.toptracks.track
      }
      else {
        response = res.data.tracks.track
      }

      for (let i in response) {
        this.tracklist[i] = response[i].artist.name + ', ' + response[i].name;
      }
    }
    catch (error) {
      console.log(error);
    }

    if (this.tracklist.length > 0) {
      this.getSongFromDatabase();
    }
    else {
      this.setErrorModal('No tracks found from LastFM API, try again')
      return;
    }
  }

  fetchTracklistFromDatabase = async () => {
    console.log('fetch tracklist from database')
    let type = this.state.type === 'artist' ? 'artists' : 'genres'
    await db.collection(type).get()
    .then(querySnapshot => {
      this.tracklist = []
      querySnapshot.forEach(doc =>{
          let tracks = doc.data()
          for(let a in tracks){
            this.tracklist.push({[a]: tracks[a]})
          }
      })
    })

    if (this.tracklist.length > 0) {
      this.setErrorModal(false)
      return this.getSongFromTracklist();
    }
    else {
      this.setErrorModal('No tracks found from database, try again')
      return;
    }
  }

  getSong = () => {
    console.log('get song')
    if(this.state.apiError){
      return this.getSongFromTracklist()
    }
    else {
      return this.getSongFromDatabase()
    }
  }

  getSongFromTracklist = async () => {
    console.log('get song from tracklist')
    let track = await this.tracklist[Math.floor(Math.random() * this.tracklist.length)]
    this.setState({
      title: Object.keys(track)[0],
      source: Object.values(track)[0]
    })
  }

  getSongFromDatabase = async () => {
    console.log('get song from database')

    this.youtubeVideos = [];
    this.setState({ updateCounter: '' });

    let title = await this.tracklist[Math.floor(Math.random() * this.tracklist.length)]
    console.log(this.state.genre)
    console.log(title)
    let source = await db.collection('good_songs').doc(this.state.genre).collection(title).doc('details')
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
        console.log('firestore error')
        console.log('Error getting document:', error);
        return this.getSongFromYoutube(title);
      });
    
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

    if (source === undefined) {
      console.log('source undefined')
      return this.getSongFromYoutube(title);
    }
    else {
      this.setState({
        title: title,
        source: source
      })
      
      db.collection(this.state.type === 'artist' ? 'artists' : 'genres').doc(this.state.genre).set({
        [title]: this.state.source
      }, {merge: true} )
      .catch(error => {
        console.error('Error adding document: ', error);
      });
      
    }
  }

  getSongFromYoutube = (title) => {
    console.log('get song from youtube ' + title)
    if (this.errorCounter >= this.state.errorLimit) {
      this.setErrorModal('Too many errors with YouTube')
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
          this.errorCounter++;
          console.log('res error')
          console.log(res.error.message);
          return this.getSongFromYoutube(title);
        }

        if (res.items === undefined || res.items === 'undefined' || res.items.length === 0) {
          this.errorCounter++;
          console.log('res.items error')
          return this.getSongFromYoutube(title);
        }

        let test = title.split(',')
        let artist = test[0].toLowerCase()
        let track = test[1].toLowerCase().trim()

        for (i in res.items) {
          let string = res.items[i].snippet.title.toLowerCase()

            if(string.includes(artist) || string.includes(track)){
              if(string.includes('karaoke')){
                this.youtubeVideos.push(YOUTUBE_URL_EMBED + res.items[i].id.videoId + '?autoplay=1&controls=0');
              }
            }
        }

        if(this.youtubeVideos.length === 0){
          console.log('videos length === 0')
          this.errorCounter++
          return this.getSongFromYoutube(title);
        }

        this.setState({
          title: title,
          source: this.youtubeVideos[0],
          updateCounter: this.youtubeVideos.length
        });
        
        db.collection(this.state.type === 'artist' ? 'artists' : 'genres').doc(this.state.genre).set({
          [title]: this.youtubeVideos[0]
        }, {merge: true} )
        .catch(error => {
          console.error('Error adding document: ', error);
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  updateSong() {
    this.youtubeVideos.shift();

    if (this.youtubeVideos.length > 0) {
      this.setState({
        source: this.youtubeVideos[0],
        updateCounter: this.youtubeVideos.length
      });
      
      db.collection(this.state.type === 'artist' ? 'artists' : 'genres').doc(this.state.genre).set({
        [this.state.title]: this.youtubeVideos[0]
      }, {merge: true} )
      .catch(error => {
        console.error('Error adding document: ', error);
      });
    }
    else {
      this.getSongFromYoutube(this.state.title);
    }
  }

  resetSong() {
    this.setState({
      title: '',
      source: '',
      genre: 'rock',
      currentSinger: '',
      updateCounter: ''
    })
    this.tracklist = [];
    this.youtubeVideos = [];
    this.errorCounter = 0;
  }
}
export default App;
