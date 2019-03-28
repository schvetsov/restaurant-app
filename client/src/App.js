import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import SmallCard from './containers/SmallCard';
import BigCard from './containers/info/BigCard';
import { connect } from 'react-redux';

class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.doSearch = this.doSearch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getDirections = this.getDirections.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.getDirections = this.getDirections.bind(this);
  }

  dispatch = (value) => {
    this.props.dispatch({ type: "CHANGEINPUT", value: value })
  };

  dispatch1 = (value) => {
    value = {
      value1: value.latitude,
      value2: value.longitude
    }
    this.props.dispatch({ type: "GEOLOCATION", value: value })
  };

  dispatch2 = (value) => {
    this.props.dispatch({ type: "YELPRESPONSE", value: value })
  };

  dispatch3 = (value) => {
    this.props.dispatch({ type: "DIRECTIONS", value: value })
  };

  dispatch4 = (value) => {
    this.props.dispatch({ type: "SELECTED", value: value })
  };

  //Update state for text input
  handleChange(event) {
    this.dispatch(event.target.value)
  }

  //Get user coordinates when app loads
  componentDidMount() {

    var getPosition = function (options) {
      return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    }
    
  getPosition()
    .then((position) => {
      this.dispatch1(position.coords)
      // console.log(crd);
    })
    .catch((err) => {
      console.error(err.message);
    });
  }

  //Do the search on Yelp
  doSearch() {

    axios.get('/yelp', {
      params: {
        input: this.props.input,
        latitude: this.props.origLat,
        longitude: this.props.origLong
      }
    })
    .then(res => {
      console.log(res.data.color);
      this.dispatch2(res.data.color);
      console.log(this.props.result);
    })
    .catch(err => console.log(err))

  }

  getInfo(value) {
    console.log(this.props.result[value])
    this.dispatch4(this.props.result[value])
    // console.log(this.props.selected)
  }

  //Get directions from Google Directions API
  getDirections(value) {

    let directions = [];
    axios.get('/directions', {
      params: {
        origLat: this.props.origLat,
        origLong: this.props.origLong,
        destLat: value.latitude,
        destLong: value.longitude
      }
    })
    .then(res => { console.log(res)
      for (let i=0; i<res.data.directions[0].legs[0].steps.length; i++) {
        let data = res.data.directions[0].legs[0].steps[i].html_instructions + '---' + 
          res.data.directions[0].legs[0].steps[i].distance.text + '---' + 
          res.data.directions[0].legs[0].steps[i].duration.text;
        directions.push(data)
      }
      this.dispatch3(directions)
      console.log(this.props.directions);
    })
    .catch(err => {
      console.log(err)
    })
  }

  render() {
    
    const items = this.props.result.map((_,i) => 
      <SmallCard
        key={i + 1}
        number={i}
        result={this.props.result[i]}
        origLat={this.props.origLat}
        origLong={this.props.origLong}
        getInfo={this.getInfo}
      />)

    return ( 
      <div className="App">
        <div className="left-screen">
          <div className="search">
            <input type="text" value={this.props.input} onChange={this.handleChange}></input>
            <button onClick={this.doSearch}>Search</button>
          </div>
          <div className="actors-list">{items}</div>
        </div>
        {this.props.selected ?
          <BigCard 
            selected={this.props.selected}
            getDirections={this.getDirections}
            directions={this.props.directions}
          />
        :
          <div></div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  input: state.input,
  origLat: state.origLat,
  origLong: state.origLong,
  result: state.result,
  selected: state.selected,
  directions: state.directions
})

export default connect(mapStateToProps)(App);
