import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

const api = require('./json/api.json');
const lastFmData = require('./json/lastfm.json');

const ROOT_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const ROOT_URL_EMBED = 'https://www.youtube.com/embed';
const data = [];

class App extends React.Component {

  state = {
    title: "Welcome",
    source: null
  }

  getSong() {

    for(let i in lastFmData.tracks.track){
        data[i] = lastFmData.tracks.track[i].artist.name + " - " + lastFmData.tracks.track[i].name;
    }

    let nmbr = Math.floor(Math.random() * 50);

    const track = data[nmbr];
    const source = window.localStorage.getItem(track)

    this.setState({
      title: track,
      source: source
    })

    if(window.localStorage.getItem(this.state.title, this.state.source)){
      console.log('item found');
      return;
    }
    else{
      console.log('item not found, fetch' + track);
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
            console.log('quota used, return');
              this.getSong();
            });
    }
      

  }

  componentDidMount(){
    this.getSong();
  }

  render() {
    return (
      <BrowserRouter>
      <Route path="/" render={() => (
        <div>
          <h1>Karaoke roulette</h1>
          <div id="player">
            <p>{this.state.title}</p>
          </div>
          <div id="player">
            <iframe 
              title="youtube"
              id="player-frame"
              width="500px" 
              height="300px"
              src={this.state.source}
              frameBorder="0" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
      )}/>
      </BrowserRouter>
    );
  }
}
export default App;
