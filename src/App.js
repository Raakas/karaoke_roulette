import React from 'react';
import {BrowserRouter, Route, Redirect, Link} from 'react-router-dom';
import StartComponent from './components/StartComponent';
import PlayerComponent from './components/PlayerComponent';
import HostComponent from './components/HostComponent';
import JoinComponent from './components/JoinComponent';

const api = require('./json/api.json');
const lastFmData = require('./json/lastfm.json');
const player = '';

const ROOT_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const ROOT_URL_EMBED = 'https://www.youtube.com/embed';
const data = [];

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    title: "Welcome",
    source: "https://www.youtube.com/embed/FXRAsUOblV4"
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

  getSong() {

    for(let i in lastFmData.tracks.track){
      data[i] = lastFmData.tracks.track[i].artist.name + " - " + lastFmData.tracks.track[i].name;
  }

    let nmbr = Math.floor(Math.random() * 50);

    const track = data[nmbr];

    if(window.localStorage.getItem(track)){
      this.setState({
        title: track,
        source: window.localStorage.getItem(track) + "?autoplay=1"
      })
    }
    else {
      fetch(`${ROOT_URL_REQUEST}?part=snippet&key=${api.keys[0].youtube}&q=karaoke+${track}&type=video`)
      .then(response => response.json())
      .then(res => {
        let source = ROOT_URL_EMBED + "/" + res.items[0].id.videoId;
        
        this.setState({
          title: track,
          source: source
        })

        window.localStorage.setItem(this.state.title, this.state.source);

    })
    .catch(error => {
      console.log(error);
      });
    }
  }


  render() {
    return (
      <BrowserRouter>
      <Route path="/" render={() => (
        <Redirect to="start" />
      )} />
      <Route path="/start" render={() =>(
        <StartComponent />
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
          newSong={this.newSong.bind(this)}
        />
      </>
      )} />
      </BrowserRouter>
    );
  }
  newSong(){
    this.getSong();
  }
  fullScreen(){
    const elem = document.querySelector('iframe');
    elem.requestFullscreen();
  }
}
export default App;
