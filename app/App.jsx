import React, {Component} from "react";
import {connect} from "react-redux";
import Nav from "components/Nav";
import Footer from "components/Footer";

import "./App.css";

import {isAuthenticated} from "../src";

class App extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {
    const {children} = this.props;
    // console.log(this.props.env);
    return <div id="App">
      <Nav />
      <div className="test-1"></div>
      <div className="test-2"></div>
      <div className="box red"></div>
      <div className="box green"></div>
      <div>{ children }</div>
      <Footer />
    </div>;
  }

}

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(state => ({env: state.env}), mapDispatchToProps)(App);
