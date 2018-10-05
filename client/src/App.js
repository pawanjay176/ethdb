import React, { Component } from "react";
import "./App.css";
import { connect } from './utils/socketUtils';
// import { throws } from "assert";

class App extends Component {
  state = {blockdata: null};

  constructor(props) {
    super(props);
    connect(message => {
      this.setState({blockdata: message});
    });
  }

  mapObject(object, callback) {
    return Object.keys(object).map(function (key) {
      return callback(key, object[key]);
    });
  }

  render() {
    if(!this.state.blockdata) {
      return <div>Loading Blocks...</div>;
    } 
    return (
      <div className="App">
        <header className="App-header">
          <h1> Data for block {this.state.blockdata.number} </h1>
        </header>
        <div>
          {this.mapObject(this.state.blockdata, function (key, value) {
            return <div>{key} : {value}</div>;
          })}
        </div>
      </div>
    );
  }
}

export default App;
