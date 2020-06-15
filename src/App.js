import React from 'react';
import axios from 'axios';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';
import firebase from 'firebase'
import StartComponent from './components/StartComponent';
import PlayerComponent from './components/PlayerComponent';
import './app.scss'

require('dotenv').config();

const YOUTUBE_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_URL_EMBED = 'https://www.youtube.com/embed';
const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
})

const db = firebase.firestore();

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
  }

  tracklist = [];
  youtubeVideos = [];
  errorCounter = 0;

  state = {
    songId: "",
    title: "",
    source: "",
    genre: "rock",
    updateCounter: ""
  }

  handleChange(event){
    let str = event.target.value.toLowerCase()
    this.setState({
      genre: str
    })
  }

  render() {
    return (
      <div className="main">
        <BrowserRouter>
        <Route path="/" render={() => (
          <Redirect to="start" />
        )} />
        <Route path="/start" render={() =>(
          <StartComponent
            handleChange={this.handleChange.bind(this)}
            fetchTracklist={this.fetchTracklist.bind(this)}
          />
        )}/>
        <Route path="/player" render={() => (
        <>
          <PlayerComponent 
            title={this.state.title}
            player={this.state.player}
            source={this.state.source}
            resetSong={this.resetSong.bind(this)}
            getSongFromDatabase={this.getSongFromDatabase.bind(this)}
            updateSong={this.updateSong.bind(this)}
            updateCounter={this.state.updateCounter}
          />
        </>
        )} />
        </BrowserRouter>
      </div>
    );
  }

  fetchTracklist = async () => {
    try{
      let res = await axios.get(`${LASTFM_URL}tag=${this.state.genre}&api_key=${process.env.REACT_APP_LASTFM_API_KEY}&format=json`)

      for(let i in res.data.tracks.track){
        this.tracklist[i] = res.data.tracks.track[i].artist.name + ", " + res.data.tracks.track[i].name;
      }
    }
    catch(error){
      console.log(error)
    }
    
    if(this.tracklist.length > 0) {
      this.getSongFromDatabase();
    }
    else {
      console.log("no track founds, try again");
      return;
    }
  }

  getSongFromDatabase = async () => {

    this.youtubeVideos = [];
    this.setState({updateCounter: ""})

    let title = await this.tracklist[Math.floor(Math.random() * this.tracklist.length)]
    let source = await db.collection("good_songs").doc(this.state.genre).collection(title).doc("details")
    .get()
    .then(function(doc) {
      if (doc.exists) {
        return doc.data().source;
      } else {
        return doc.data()
      }
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
    });

    this.setState({ title: title })

    if(source === undefined){
      return this.getSongFromYoutube();
    }
    else {
      this.setState({
        source: source
      })
    }
  }

  getSongFromYoutube() {
    if(this.errorCounter > 5){
      console.log("too many errors, try again");
      return;
    }

    this.youtubeVideos = [];

    fetch(`${YOUTUBE_URL_REQUEST}?part=snippet&key=${process.env.REACT_APP_YOUTUBE_API_KEY}&q=karaoke+${this.state.title}&type=video&videoEmbeddable=true&safeSearch=strict`)
    .then(response => response.json())
    .then(res => {
      let i = 0;

      console.log(res);

      if(res.error){
        console.log(res.error.message)
      }

      if(res.items === undefined || res.items === "undefined" || res.items.length === 0){
        this.errorCounter++;
        return this.getSongFromYoutube();
      }
      
      for(i in res.items){
        this.youtubeVideos.push(YOUTUBE_URL_EMBED + "/" + res.items[i].id.videoId + "?autoplay=1");
      }

      this.setState({
        source: this.youtubeVideos[0],
        updateCounter: this.youtubeVideos.length
      });

      db.collection("good_songs").doc(this.state.genre).collection(this.state.title).doc("details").set({
        title: this.state.title,
        source: this.state.source
      })
      .catch(error => {
          console.error("Error adding document: ", error);
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  updateSong() {
    this.youtubeVideos.shift()
    
    if(this.youtubeVideos.length > 0) {
      this.setState({
        source: this.youtubeVideos[0],
        updateCounter: this.youtubeVideos.length
      });

      db.collection("good_songs").doc(this.state.genre).collection(this.state.title).doc("details").update({
        source: this.youtubeVideos[0]
      })
    }
    else {
      this.getSongFromYoutube();
    }
  }

  resetSong(){
    this.setState({
      title: "",
      source: "",
      genre: "",
      updateCounter: ""
    })
    this.tracklist = [];
    this.youtubeVideos = [];
    this.errorCounter = 0;
  }
}
export default App;
