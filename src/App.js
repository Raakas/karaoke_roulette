import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

const api = require('../src/api.json');
const lastFmData = require('./json/lastfm.json');

const ROOT_URL_REQUEST = 'https://www.googleapis.com/youtube/v3/search';
const ROOT_URL_EMBED = 'https://www.youtube.com/embed';
const data = [];

class App extends React.Component {

  state = {
    title: null
  }

  getLastFm() {
    for(let i in lastFmData.tracks.track){
        data[i] = lastFmData.tracks.track[i].name;
    }

    let nmbr = Math.floor(Math.random() * 50);
    console.log(nmbr);

    const track = data[nmbr];

    this.setState({
      title: track
    })
    
    fetch(`${ROOT_URL_REQUEST}?part=snippet&key=${api.keys[0].youtube}&q=${track}&type=video`)
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
