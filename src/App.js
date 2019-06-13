import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import PlayerComponent from './components/PlayerComponent'

const lastFmData = require('./json/lastfm.json');
const data = [];
const API_KEY = 'AIzaSyBixbrC7OcjguABsPRHaz1x9qJphT5XsRU';
const ROOT_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const ROOT_URL_EMBED = 'https://www.youtube.com/embed';

class App extends React.Component {

  state = {
    title: null
  }

  getLastFm() {
    for(let i in lastFmData.tracks.track){
        data[i] = lastFmData.tracks.track[i].name;
    }

    const track = data[4];

    this.setState({
      title: track
    })
    
    fetch(`${ROOT_URL_REQUEST}?part=snippet&key=${API_KEY}&q=${track}&type=video`)
    .then(response => response.json())
    .then(res => {

          console.log(res);
          
        const source = ROOT_URL_EMBED + "/" + res.items[0].id.videoId;
        
        console.log(source);
        this.setState({
          src: source
        })

        })
        .catch(error => console.log(error));
  }

  componentDidMount(){
    this.getLastFm();
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
            width="560" 
            height="315" 
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
