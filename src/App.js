import React from 'react';
import axios from 'axios';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';
import StartComponent from './components/StartComponent';
import PlayerComponent from './components/PlayerComponent';
import './app.scss'


const api = require('./json/api.json');

const YOUTUBE_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_URL_EMBED = 'https://www.youtube.com/embed';
const LAST_FM_URL = 'http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&';


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
  }

  tracklist = [];
  songlist = [];
  currentTrack = "";

  state = {
    title: "",
    source: "",
    genre: "rock",
    update: 0
  }

  handleChange(event){
    this.setState({
      genre: event.target.value
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
            getSong={this.getSong.bind(this)}
            updateSong={this.updateSong.bind(this)}
            updateCounter={this.state.updateCounter}
          />
        </>
        )} />
        </BrowserRouter>
      </div>
    );
  }

  fetchTracklist() {
    axios.get(`${LAST_FM_URL}tag=${this.state.genre}&api_key=${api.keys[1].lastfm}&format=json`)
        .then(res => {
          for(let i in res.data.tracks.track){
            this.tracklist[i] = res.data.tracks.track[i].artist.name + " - " + res.data.tracks.track[i].name;
          }
        })
        .catch(error => { console.log(error) });
  }

  getSong() {
    this.songlist = [];
    this.currentTrack = this.tracklist[Math.floor(Math.random() * this.tracklist.length)];

    if(localStorage.getItem(this.currentTrack)){
      this.setState({
        title: this.currentTrack,
        source: localStorage.getItem(this.currentTrack)
      })
    }
    else {
      fetch(`${YOUTUBE_URL_REQUEST}?part=snippet&key=${api.keys[0].youtube}&q=karaoke+${this.currentTrack}&type=video`)
      .then(response => response.json())
      .then(res => {
        let i = 0;  

        for(i in res.items){
          this.songlist.push(YOUTUBE_URL_EMBED + "/" + res.items[i].id.videoId + "?autoplay=1");
        }
        this.setState({
          title: this.currentTrack,
          source: this.songlist[0],
          updateCounter: this.songlist.length
        });

        localStorage.setItem(this.currentTrack, this.songlist[0])
      })
      .catch(error => {
        console.log(error);
      });
    }
  }

  updateSong() {
    this.songlist.shift()
    localStorage.removeItem(this.currentTrack)
    
    if(this.songlist.length > 0) {
      this.setState({
        source: this.songlist[0],
        updateCounter: this.songlist.length
      });
      
      localStorage.setItem(this.currentTrack, this.songlist[0])
    }
    else {
      this.getSong();
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
    this.songlist = [];
    this.currentTrack = "";
  }
}
export default App;
