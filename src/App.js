import React from 'react';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';
import StartComponent from './components/StartComponent';
import PlayerComponent from './components/PlayerComponent';
import HostComponent from './components/HostComponent';
import JoinComponent from './components/JoinComponent';

const api = require('./json/api.json');
const lastFmData = require('./json/lastfm.json');

const ROOT_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const ROOT_URL_EMBED = 'https://www.youtube.com/embed';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  tracklist = [];
  songlist = [];
  currentTrack = '';

  state = {
    title: "",
    source: ""
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }

  handleSubmit(event) {
    const name = event.target[0].attributes.value.value;
    this.setState({
      player: name
    })
    event.preventDefault();
  }

  render() {
    return (
      <BrowserRouter>
      <Route path="/" render={() => (
        <Redirect to="start" />
      )} />
      <Route path="/start" render={() =>(
        <StartComponent 
          fetchTracklist={this.fetchTracklist.bind(this)}
        />
      )}/>
      <Route path="/host" render={() => (
        <HostComponent />
      )}/>
      <Route path="/join" render={() => (
        <JoinComponent />
      )}/>
      <Route path="/player" render={() => (
      <>
        <PlayerComponent 
          title={this.state.title}
          player={this.state.player}
          source={this.state.source}
          play={this.fullScreen.bind(this)}
          getSong={this.getSong.bind(this)}
          updateSong={this.updateSong.bind(this)}
        />
      </>
      )} />
      </BrowserRouter>
    );
  }
  fetchTracklist(){
    for(let i in lastFmData.tracks.track){
      this.tracklist[i] = lastFmData.tracks.track[i].artist.name + " - " + lastFmData.tracks.track[i].name;
    }
  }
  getSong() {
    this.songlist = [];
    this.currentTrack = this.tracklist[Math.floor(Math.random() * 50)];
    
    if(window.localStorage.getItem(this.currentTrack)){
      this.setState({
        title: this.currentTrack,
        source: window.localStorage.getItem(this.currentTrack)
      })
    }
    else {
      fetch(`${ROOT_URL_REQUEST}?part=snippet&key=${api.keys[0].youtube}&q=karaoke+${this.currentTrack}&type=video`)
      .then(response => response.json())
      .then(res => {
        let i = 0;
        for(i in res.items){
          this.songlist.push(ROOT_URL_EMBED + "/" + res.items[i].id.videoId + "?autoplay=1");
        }
        this.setState({
          title: this.currentTrack,
          source: this.songlist[0]
        });

        window.localStorage.setItem(this.currentTrack, this.songlist[0])
      })
      .catch(error => {
        console.log(error);
      });
    }
  }
  updateSong(){
    this.songlist.shift()
    window.localStorage.removeItem(this.currentTrack)

    if(this.songlist.length > 1) {
      this.setState({
        source: this.songlist[0]
      });
      window.localStorage.setItem(this.currentTrack, this.songlist[0])
    }
    else {
      this.getSong();
    }
  }
  fullScreen(){
    const elem = document.querySelector('iframe');
    elem.requestFullscreen();
  }
}
export default App;
