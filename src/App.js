import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';


const lastFmData = require('./json/lastfm.json');

class App extends React.Component {

  state = {
    data: null
  }

  componentDidMount() {
    this.setState({
      data: lastFmData.tracks.track[12].name
    })
  }

  render() {
    return (
      <BrowserRouter>
      <Route path="/" render={() => (
        <div>
          <h1>Karaoke roulette</h1>
          <div id="player">
            <p>{this.state.data}</p>
          </div>
        </div>
      )}/>
      </BrowserRouter>
    );
  }
}

export default App;
