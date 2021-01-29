import React from 'react';
import axios from 'axios';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import firebase from 'firebase'
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
      songId: '',
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
      path: ''
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
              getSongFromDatabase={this.getSongFromDatabase.bind(this)}
              updateSong={this.updateSong.bind(this)}
              updateCounter={this.state.updateCounter}
            />
          )} />
          {this.state.modalVisible
            ? <MessageComponent
              message={this.state.message}
              setModalVisibility={this.setModalVisibility.bind(this)}
            />
            : null
          }
        </BrowserRouter>
      </div>
    );
  }
  
  setModalVisibility() {
    if (this.state.modalVisible === true) {
      this.setState({
        modalVisible: true
      })
    }
    else {
      this.setState({
        modalVisible: false
      })
    }
  }

  fetchTracklist = async () => {
    if (this.state.genre === '' || this.state.genre === ' ' || this.state.genre === null || this.state.genre === undefined) {
      this.state.modalVisible = false;
      this.state.message = {
        title: 'Error',
        message: 'No tracks found, try again'
      }
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
      this.state.modalVisible = false;
      this.state.message = {
        title: 'Error',
        message: 'No tracks found, try again'
      }
      return;
    }
  }

  fetchTracklistFromDatabase = async () => {
    await db.collection(this.state.type === 'artist' ? 'artists' : 'genres').get()
    .then(querySnapshot => {
      this.tracklist = []
      console.log(querySnapshot)
      querySnapshot.forEach(doc =>{
          console.log(doc.id)
          let track = doc.data()
          for(let a in track){
            console.log(a)
            this.tracklist.push(a)
          }
      })
    })

    if (this.tracklist.length > 0) {
      this.getSongFromDatabase();
    }
    else {
      this.state.modalVisible = false;
      this.state.message = {
        title: 'Error',
        message: 'No tracks found, try again'
      }
      return;
    }
  }

  getSongFromDatabase = async () => {

    this.youtubeVideos = [];
    this.setState({ updateCounter: '' });

    let title = await this.tracklist[Math.floor(Math.random() * this.tracklist.length)]
    let source = await db.collection('good_songs').doc(this.state.genre).collection(title).doc('details')
      .get()
      .then(function (doc) {
        if (doc.exists) {
          return doc.data().source;
        } else {
          return doc.data();
        }
      })
      .catch(function (error) {
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
    if (this.errorCounter > 5) {
      console.log('too many errors, try again');
      return;
    }
    this.youtubeVideos = [];
        
    fetch(`${YOUTUBE_URL_REQUEST}?part=snippet&key=${process.env.REACT_APP_YOUTUBE_API_KEY}&q=karaoke+${title}&type=video&videoEmbeddable=true&safeSearch=strict`)
      .then(response => response.json())
      .then(res => {
        let i = 0;

        if (res.error) {
          console.log(res.error.message);
        }

        if (res.items === undefined || res.items === 'undefined' || res.items.length === 0) {
          this.errorCounter++;
          return this.getSongFromYoutube();
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
          return this.getSongFromYoutube();
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
